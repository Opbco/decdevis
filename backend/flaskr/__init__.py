import os
from flask import Flask, request, abort, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
import jwt
from dotenv import find_dotenv, load_dotenv
from auth.auth import AuthError, requires_auth
from models.models import Arrondissement, Departement, Role, Structure, setup_db, db, User, Region
from .validate import validate_dateformat, validate_email_and_password, validate_user
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash
from operator import or_

ITEMS_PER_PAGE = 10
ENV_FILE = find_dotenv()
if ENV_FILE:
    load_dotenv(ENV_FILE)

JWT_SECRET = os.environ.get('JWT_SECRET', 'abc123abc1234')


def handle_pagination(request, selection):
    page = request.args.get('page', 1, type=int)
    start = (page - 1) * ITEMS_PER_PAGE
    end = start + ITEMS_PER_PAGE
    return selection[start:end]


def create_app(test_config=None):
    # create and configure the app
    app = Flask(__name__)
    app.config['SECRET_KEY'] = JWT_SECRET
    setup_db(app)
    migrate = Migrate(app, db)
    '''
    @TODO: Set up CORS. Allow '*' for origins. Delete the sample route after completing the TODOs
    '''
    CORS(app)

    '''
  @TODO: Use the after_request decorator to set Access-Control-Allow
  '''
    @app.after_request
    def after_request(response):
        response.headers.add("Access-Control-Allow-Headers",
                             "Content-Type,Authorization,true")
        response.headers.add("Access-Control-Allow-Methods",
                             "GET,PUT,POST,DELETE,OPTIONS")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response

    """
    get current user information from the token
    """
    @app.route("/api/v1/users/me", methods=["GET"])
    @requires_auth('get:user')
    def get_current_user(current_user):
        return jsonify({
            "success": True,
            "message": "successfully retrieved user profile",
            "data": current_user
        })

    """
    register a new user to the database
    """
    @app.route('/api/v1/register', methods=['POST'])
    def register():
        data = request.get_json()
        email = data.get('email', None)
        user_name = data.get('user_name', None)
        password = data.get('password', None)
        is_validated = validate_user(**data)
        if is_validated is not True:
            return jsonify({'success': False, 'message': 'Invalid data entry', 'error': is_validated}), 409
        test = User.query.filter(
            or_(User.email == email, User.user_name == user_name)).first()
        if test:
            return jsonify({'success': False, 'message': 'That email or username already exists'}), 409
        else:
            try:
                default_role = Role.getByName('ROLE_USER')
                user = User(user_name=user_name,
                            email=email, password=generate_password_hash(password), role_id=default_role.id)
                user.insert()
                return jsonify({'success': True, 'data': user.short_repr(), 'message': 'User created successfully'}), 201
            except:
                abort(500)

    '''
    Log the user in by generating a valid JWT
    '''
    @app.route("/api/v1/login", methods=["POST"])
    def login():
        try:
            data = request.get_json()
            if not data:
                return jsonify({
                    "success": False,
                    "message": "Please provide user details",
                    "data": None,
                    "error": "Bad request"
                }), 400
            # validate input
            is_validated = validate_email_and_password(
                data.get('email'), data.get('password'))
            if is_validated is not True:
                return jsonify({'success': False, 'message': 'Invalid data entry', 'error': is_validated}), 400
            user = User.login(
                data.get('email'),
                data.get('password')
            )
            if user:
                # token should expire after 30 minutes
                response = {}
                response["exp"] = datetime.utcnow() + timedelta(minutes=30)
                response["token"] = jwt.encode(
                    user,
                    JWT_SECRET,
                    algorithm="HS256"
                )

                return jsonify({
                    "success": True,
                    "message": "Successfully logged in",
                    "data": response
                })

            return jsonify({
                "success": False,
                "message": "Wrong email or password"
            }), 404
        except:
            abort(500)

    '''
    api to manage regions
    '''
    @app.route('/api/v1/regions/<int:region_id>')
    @requires_auth('get:regions')
    def get_region_by_id(current_user, region_id):
        region = Region.query.filter_by(id=region_id).one_or_none()
        if region is None:
            abort(404)
        return jsonify({'success': True, 'data': region.json()}), 200

    @app.route('/api/v1/regions/<string:name>')
    @requires_auth('get:regions')
    def get_region_by_name(current_user, name):
        regions = Region.query.filter(
            Region.region_name.ilike(f'%{name}%')).all()
        data = []
        for region in regions:
            data.append(region.json())
        return jsonify({'success': True, 'data': data}), 200

    @app.route('/api/v1/regions', methods=["POST"])
    @requires_auth('post:regions')
    def post_regions(current_user):
        data = request.get_json()
        if not data.get('name'):
            abort(400)
        region = Region.query.filter_by(region_name=data["name"]).one_or_none()
        if region:
            return jsonify({'success': False, 'error': 400, 'message': 'That region already exist'}), 400
        try:
            region = Region(region_name=data["name"])
            region.insert()
            return jsonify({'success': True, 'data': region.json()}), 201
        except:
            abort(500)

    @app.route('/api/v1/regions/<int:region_id>', methods=["PUT"])
    @requires_auth('put:regions')
    def put_regions(current_user, region_id):
        data = request.get_json()
        if not data.get('name'):
            abort(400)
        region = Region.query.filter_by(id=region_id).one_or_none()
        if region is None:
            abort(404)
        region_wname = Region.query.filter_by(
            region_name=data["name"]).one_or_none()
        if region_wname:
            return jsonify({'success': False, 'error': 400, 'message': 'That region already exist'}), 400
        try:
            region.region_name = data["name"]
            region.update()
            return jsonify({'success': True, 'data': region.json()}), 200
        except:
            abort(500)

    @app.route('/api/v1/regions')
    @requires_auth('get:regions')
    def get_all_regions(current_user):
        regions = Region.query.all()
        data = []
        for region in regions:
            data.append(region.json())
        return jsonify({'success': True, 'data': data}), 200

    @app.route('/api/v1/regions/<int:region_id>/departements')
    @requires_auth('get:departements')
    def get_all_departements_by_region(current_user, region_id):
        region = Region.query.filter_by(id=region_id).one_or_none()
        if region is None:
            abort(404)
        data = []
        for departement in region.departements:
            data.append(departement.json())
        return jsonify({'success': True, 'data': data}), 200

    @app.route('/api/v1/regions/<int:region_id>', methods=["DELETE"])
    @requires_auth('delete:regions')
    def delete_region_by_id(current_user, region_id):
        region = Region.query.filter_by(id=region_id).one_or_none()
        if region is None:
            abort(404)
        try:
            region.delete()
            return jsonify({'success': True, 'data': f'The region with the ID {region_id} has been deleted'}), 200
        except:
            abort(500)

    '''
    api to manage departments
    '''
    @app.route('/api/v1/departements/<int:departement_id>')
    @requires_auth('get:departements')
    def get_departement_by_id(current_user, departement_id):
        departement = Departement.query.filter_by(
            id=departement_id).one_or_none()
        if departement is None:
            abort(404)
        return jsonify({'success': True, 'data': departement.json()}), 200

    @app.route('/api/v1/departements/<string:name>')
    @requires_auth('get:departements')
    def get_departement_by_name(current_user, name):
        departements = Departement.query.filter(
            Departement.departement_name.ilike(f'%{name}%')).all()
        data = []
        for departement in departements:
            data.append(departement.json())
        return jsonify({'success': True, 'data': data}), 200

    @app.route('/api/v1/departements', methods=["POST"])
    @requires_auth('post:departements')
    def post_departements(current_user):
        data = request.get_json()
        name = data.get('name', None)
        region = data.get('region', None)
        if name is None or region is None:
            abort(400)
        departement = Departement.query.filter_by(
            departement_name=name).one_or_none()
        if departement:
            return jsonify({'success': False, 'error': 400, 'message': 'That departement already exist'}), 400
        try:
            departement = Departement(
                departement_name=name, region_id=region)
            departement.insert()
            return jsonify({'success': True, 'data': departement.json()}), 201
        except:
            abort(500)

    @app.route('/api/v1/departements/<int:departement_id>', methods=["PUT"])
    @requires_auth('put:departements')
    def put_departements(current_user, departement_id):
        data = request.get_json()
        name = data.get('name', None)
        region = data.get('region', None)
        if name is None or region is None:
            abort(400)
        departement = Departement.query.filter_by(
            id=departement_id).one_or_none()
        if departement is None:
            abort(404)
        departement_wname = Departement.query.filter_by(
            departement_name=name).one_or_none()
        if departement_wname:
            return jsonify({'success': False, 'error': 400, 'message': 'That Departement already exist'}), 400
        try:
            departement.departement_name = name
            departement.region_id = region
            departement.update()
            return jsonify({'success': True, 'data': departement.json()}), 200
        except:
            abort(500)

    @app.route('/api/v1/departements')
    @requires_auth('get:departements')
    def get_all_departements(current_user):
        departements = Departement.query.all()
        data = []
        for departement in departements:
            data.append(departement.json())
        return jsonify({'success': True, 'data': data}), 200

    @app.route('/api/v1/departements/<int:departement_id>', methods=["DELETE"])
    @requires_auth('delete:departements')
    def delete_departement_by_id(current_user, departement_id):
        departement = Departement.query.filter_by(
            id=departement_id).one_or_none()
        if departement is None:
            abort(404)
        try:
            departement.delete()
            return jsonify({'success': True, 'message': f'the departement with ID {departement_id} has been deleted'}), 200
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

    @app.route('/api/v1/departements/<int:departement_id>/arrondissements')
    @requires_auth('get:arrondissements')
    def get_all_arrondissements_by_departement(current_user, departement_id):
        departement = Departement.query.filter_by(
            id=departement_id).one_or_none()
        if departement is None:
            abort(404)
        data = []
        for arrondissement in departement.arrondissements:
            data.append(arrondissement.json())
        return jsonify({'success': True, 'data': data}), 200

    '''
    api to manage arrondissements
    '''
    @app.route('/api/v1/arrondissements/<int:arrondissement_id>')
    @requires_auth('get:arrondissements')
    def get_arrondissement_by_id(current_user, arrondissement_id):
        arrondissement = Arrondissement.query.filter_by(
            id=arrondissement_id).one_or_none()
        if arrondissement is None:
            abort(404)
        return jsonify({'success': True, 'data': arrondissement.json()}), 200

    @app.route('/api/v1/arrondissements/<string:name>')
    @requires_auth('get:arrondissements')
    def get_arrondissement_by_name(current_user, name):
        arrondissements = Arrondissement.query.filter(
            Arrondissement.arrondissement_name.ilike(f'%{name}%')).all()
        data = []
        for arrondissement in arrondissements:
            data.append(arrondissement.json())
        return jsonify({'success': True, 'data': data}), 200

    @app.route('/api/v1/arrondissements', methods=["POST"])
    @requires_auth('post:arrondissements')
    def post_arrondissements(current_user):
        data = request.get_json()
        name = data.get('name', None)
        departement = data.get('departement', None)
        if name is None or departement is None:
            abort(400)
        arrondissement = Arrondissement.query.filter_by(
            arrondissement_name=name).one_or_none()
        if arrondissement:
            return jsonify({'success': False, 'error': 400, 'message': 'That arrondissement already exist'}), 400
        try:
            arrondissement = Arrondissement(
                arrondissement_name=name, departement_id=departement)
            arrondissement.insert()
            return jsonify({'success': True, 'data': arrondissement.json()}), 201
        except:
            abort(500)

    @app.route('/api/v1/arrondissements/<int:arrondissement_id>', methods=["PUT"])
    @requires_auth('put:arrondissements')
    def put_arrondissements(current_user, arrondissement_id):
        data = request.get_json()
        name = data.get('name', None)
        departement = data.get('departement', None)
        if name is None or departement is None:
            abort(400)
        arrondissement = Arrondissement.query.filter_by(
            id=arrondissement_id).one_or_none()
        if arrondissement is None:
            abort(404)
        arrondissement_wname = Arrondissement.query.filter_by(
            arrondissement_name=name).one_or_none()
        if arrondissement_wname:
            return jsonify({'success': False, 'error': 400, 'message': 'That Arrondissement already exist'}), 400
        try:
            arrondissement.arrondissement_name = name
            arrondissement.departement_id = departement
            arrondissement.update()
            return jsonify({'success': True, 'data': arrondissement.json()}), 200
        except:
            abort(500)

    @app.route('/api/v1/arrondissements')
    @requires_auth('get:arrondissements')
    def get_all_arrondissements(current_user):
        arrondissements = Arrondissement.query.all()
        data = []
        for arrondissement in arrondissements:
            data.append(arrondissement.json())
        return jsonify({'success': True, 'data': data}), 200

    @app.route('/api/v1/arrondissements/<int:arrondissement_id>', methods=["DELETE"])
    @requires_auth('delete:arrondissements')
    def delete_arrondissement_by_id(current_user, arrondissement_id):
        arrondissement = Arrondissement.query.filter_by(
            id=arrondissement_id).one_or_none()
        if arrondissement is None:
            abort(404)
        try:
            arrondissement.delete()
            return jsonify({'success': True, 'message': f'the arrondissement with ID {arrondissement_id} has been deleted'}), 200
        except Exception as e:
            return jsonify({'success': False, "error": 500, 'message': str(e)}), 500

    '''
    Create error handlers for all expected errors 
    '''
    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({
            "success": False,
            "error": 400,
            "message": "Bad request"
        }), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "success": False,
            "error": 404,
            "message": "Resource not found"
        }), 404

    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify({
            "success": False,
            "error": 405,
            "message": "Method Not Allowed"
        }), 405

    @app.errorhandler(422)
    def unprocessable(error):
        return jsonify({
            "success": False,
            "error": 422,
            "message": "Unprocessable Entity"
        }), 422

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "success": False,
            "error": 500,
            "message": "Internal Server Error"
        }), 500

    @app.errorhandler(AuthError)
    def handle_auth_error(ex):
        response = jsonify({
            "success": False,
            "error": ex.error,
            "message": "Auth errors"
        })
        response.status_code = ex.status_code
        return response

    return app

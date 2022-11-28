import os
from flask import Flask, request, abort, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
import jwt
from dotenv import find_dotenv, load_dotenv
from auth.auth import AuthError, requires_auth
from models.models import Arrondissement, Exam, Session, SessionCentre, Departement, Role, Structure, setup_db, db, User, Region
from .validate import get_current_session, validate_structure, validate_centre, validate_username_and_password, validate_user
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
            is_validated = validate_username_and_password(
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
        except Exception as e:
            return jsonify({'success': False, "error": 500, 'message': str(e)}), 500

    '''
    api to manage exams
    '''
    @app.route('/api/v1/exams/<int:exam_id>')
    @requires_auth('get:exams')
    def get_exam_by_id(current_user, exam_id):
        exam = Exam.query.filter_by(id=exam_id).one_or_none()
        if exam is None:
            abort(404)
        return jsonify({'success': True, 'data': exam.json()}), 200

    @app.route('/api/v1/exams/<string:name>')
    @requires_auth('get:exams')
    def get_exam_by_name(current_user, name):
        exams = Exam.query.filter(
            Exam.exam_name.ilike(f'%{name}%')).all()
        data = []
        for exam in exams:
            data.append(exam.json())
        return jsonify({'success': True, 'data': data}), 200

    @app.route('/api/v1/exams', methods=["POST"])
    @requires_auth('post:exams')
    def post_exams(current_user):
        data = request.get_json()
        if not data.get('name') or not data.get('code'):
            abort(400)
        exam = Exam.query.filter_by(exam_name=data["name"]).one_or_none()
        if exam:
            return jsonify({'success': False, 'error': 400, 'message': 'That Examination already exist'}), 400
        try:
            exam = Exam(exam_name=data["name"], exam_code=data['code'])
            exam.insert()
            return jsonify({'success': True, 'data': exam.json()}), 201
        except:
            abort(500)

    @app.route('/api/v1/exams/<int:exam_id>', methods=["PUT"])
    @requires_auth('put:exams')
    def put_exams(current_user, exam_id):
        data = request.get_json()
        if not data.get('name') or not data.get('code'):
            abort(400)
        exam = Exam.query.filter_by(id=exam_id).one_or_none()
        if exam is None:
            abort(404)
        exam_wname = Exam.query.filter_by(
            exam_name=data["name"]).one_or_none()
        if exam_wname is not None and exam_wname.id != exam_id:
            return jsonify({'success': False, 'error': 400, 'message': 'That exam already exist'}), 400
        try:
            exam.exam_name = data["name"]
            exam.exam_code = data["code"]
            exam.update()
            return jsonify({'success': True, 'data': exam.json()}), 200
        except:
            abort(500)

    @app.route('/api/v1/exams')
    @requires_auth('get:exams')
    def get_all_exams(current_user):
        exams = Exam.query.all()
        data = []
        for exam in exams:
            data.append(exam.json())
        return jsonify({'success': True, 'data': data}), 200

    @app.route('/api/v1/exams/<int:exam_id>', methods=["DELETE"])
    @requires_auth('delete:exams')
    def delete_exam_by_id(current_user, exam_id):
        exam = Exam.query.filter_by(id=exam_id).one_or_none()
        if exam is None:
            abort(404)
        try:
            exam.delete()
            return jsonify({'success': True, 'data': f'The exam with the ID {exam_id} has been deleted'}), 200
        except:
            abort(500)

    @app.route('/api/v1/exams/<int:exam_id>/sessions')
    @requires_auth('get:sessions')
    def get_all_sessions_by_exam(current_user, exam_id):
        exam = Exam.query.filter_by(id=exam_id).one_or_none()
        if exam is None:
            abort(404)
        data = []
        for session in exam.sessions:
            data.append(session.json())
        return jsonify({'success': True, 'data': data}), 200

    '''
    api to manage session
    '''
    @app.route('/api/v1/sessions/<int:session_id>')
    @requires_auth('get:sessions')
    def get_session_by_id(current_user, session_id):
        session = Session.query.filter_by(id=session_id).one_or_none()
        if session is None:
            abort(404)
        return jsonify({'success': True, 'data': session.json()}), 200

    @app.route('/api/v1/sessions/<string:name>')
    @requires_auth('get:sessions')
    def get_session_by_name(current_user, name):
        sessions = Session.query.filter(
            Session.session_name.ilike(f'%{name}%')).all()
        data = []
        for session in sessions:
            data.append(session.json())
        return jsonify({'success': True, 'data': data}), 200

    @app.route('/api/v1/sessions', methods=["POST"])
    @requires_auth('post:sessions')
    def post_sessions(current_user):
        data = request.get_json()
        if not data.get('exam'):
            abort(400)
        session = Session.query.filter(
            Session.exam_id == data["exam"], Session.session_name == get_current_session()).one_or_none()
        if session:
            return jsonify({'success': False, 'error': 400, 'message': 'That Session for that particular exam already exist'}), 400
        try:
            session = Session(
                session_name=get_current_session(), exam_id=data["exam"])
            print(session)
            session.insert()
            return jsonify({'success': True, 'data': session.json()}), 201
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

    @app.route('/api/v1/sessions/<int:session_id>', methods=["PUT"])
    @requires_auth('post:sessions')
    def put_sessions(current_user, session_id):
        data = request.get_json()
        session = Session.query.filter(
            Session.exam_id == data["exam"], Session.session_name == get_current_session()).one_or_none()
        if session is None:
            return jsonify({'success': False, 'message': "No ongoing session for this examination, please create one"}), 404
        if session.id != session_id:
            return jsonify({'success': False, 'message': "You can't edit a passed or closed session"}), 403

        try:
            session.edit(data)
            return jsonify({'success': True, 'data': session.json()}), 200
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

    @app.route('/api/v1/sessions')
    @requires_auth('get:sessions')
    def get_all_sessions(current_user):
        sessions = Session.query.all()
        data = []
        for session in sessions:
            data.append(session.json())
        return jsonify({'success': True, 'data': data}), 200

    @app.route('/api/v1/sessions/<int:session_id>/sessioncentres')
    @requires_auth('get:sessioncentres')
    def get_all_session_centres(current_user, session_id):
        session = Session.query.filter(Session.id == session_id).one_or_none()
        if session is None:
            abort(404)
        data = []
        for centre in session.sessioncentres:
            data.append(centre.json())
        return jsonify({'success': True, 'data': data}), 200

    @app.route('/api/v1/sessions/<int:session_id>/sessioncentres/<int:departement_id>')
    @requires_auth('get:sessioncentres')
    def get_all_session_centres_departement(current_user, session_id, departement_id):
        session = Session.query.filter(Session.id == session_id).one_or_none()
        if session is None:
            abort(404)
        try:
            centres = SessionCentre.centre_session_departement(
                session_id, departement_id)
            data = []
            for centre in centres:
                data.append(centre.Shortjson())
            return jsonify({'success': True, 'data': data}), 200
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

    @app.route('/api/v1/sessions/<int:session_id>', methods=["DELETE"])
    @requires_auth('delete:sessions')
    def delete_session_by_id(current_user, session_id):
        session = Session.query.filter_by(id=session_id).one_or_none()
        if session is None:
            abort(404)
        try:
            session.delete()
            return jsonify({'success': True, 'data': f'The session with the ID {session_id} has been deleted'}), 200
        except:
            abort(500)

    '''
    api to manage centre
    '''
    @app.route('/api/v1/sessioncentres/<int:sessioncentre_id>')
    @requires_auth('get:sessioncentres')
    def get_sessioncentres_by_id(current_user, sessioncentre_id):
        sessioncentre = SessionCentre.query.filter_by(
            id=sessioncentre_id).one_or_none()
        if sessioncentre is None:
            abort(404)
        return jsonify({'success': True, 'data': sessioncentre.json()}), 200

    @app.route('/api/v1/sessioncentres', methods=["POST"])
    @requires_auth('post:sessioncentres')
    def post_sessioncentres(current_user):
        data = request.get_json()
        is_validated = validate_centre(**data)
        if is_validated is not True:
            return jsonify({'success': False, 'message': 'Invalid data entry', 'error': is_validated}), 409
        session = Session.query.filter(
            Session.id == data["session"]).one_or_none()
        structure = Structure.query.filter(
            Structure.id == data["structure"]).one_or_none()
        if session is None or structure is None:
            abort(404)
        try:
            centre = SessionCentre(session_id=data["session"], structure_id=data["structure"], form_centre=data["form"], centre_id=data['centre'],
                                   type_centre=data["type"], isForDisabled=data["for_disabled"], isForOral=data["for_oral"], nbr_candidat_ecrit=data["nbr_candidat_ecrit"])
            centre.insert()
            if data.get('divide', False):
                SessionCentre.getByDivide(
                    centre.centre_id, centre.nbr_candidat_ecrit)
            return jsonify({'success': True, 'data': centre.json()}), 201
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

    @app.route('/api/v1/sessioncentres/<int:sessioncentre_id>', methods=["PUT"])
    @requires_auth('post:sessioncentres')
    def put_sessioncentres(current_user, sessioncentre_id):
        data = request.get_json()
        centre = SessionCentre.query.filter(
            SessionCentre.id == sessioncentre_id).one_or_none()
        if centre is None:
            abort(404)
        try:
            centre.update(data)
            return jsonify({'success': True, 'data': centre.json()}), 200
        except Exception as e:
            return jsonify({'success': False, 'message': str(e)}), 500

    @app.route('/api/v1/sessioncentres')
    @requires_auth('get:sessioncentres')
    def get_all_sessioncentres(current_user):
        centres = Session.query.all()
        data = []
        for centre in centres:
            data.append(centre.json())
        return jsonify({'success': True, 'data': data}), 200

    @app.route('/api/v1/sessioncentres/<int:sessioncentre_id>', methods=["DELETE"])
    @requires_auth('delete:sessioncentres')
    def delete_sessioncentres_by_id(current_user, sessioncentre_id):
        centre = SessionCentre.query.filter_by(
            id=sessioncentre_id).one_or_none()
        if centre is None:
            abort(404)
        try:
            centre.delete()
            return jsonify({'success': True, 'data': f'The centre with the ID {sessioncentre_id} has been deleted'}), 200
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
        print(data)
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
        if departement.departement_name != name and departement_wname:
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
        print(data)
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
        arrondissement_wname = Arrondissement.query.filter(
            Arrondissement.arrondissement_name == name, Arrondissement.id != arrondissement_id).one_or_none()
        if arrondissement.arrondissement_name != name and arrondissement_wname:
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

    @app.route('/api/v1/arrondissements/<int:arrondissement_id>/structures', methods=["GET"])
    @requires_auth('get:structures')
    def get_structures_arrondissement(current_user, arrondissement_id):
        arrondissement = Arrondissement.query.filter_by(
            id=arrondissement_id).one_or_none()
        if arrondissement is None:
            abort(404)
        try:
            data = []
            for structure in arrondissement.structures:
                data.append(structure.json())
            return jsonify({'success': True, 'data': data}), 200
        except Exception as e:
            return jsonify({'success': False, "error": 500, 'message': str(e)}), 500

    '''
    api to manage structures
    '''
    @app.route('/api/v1/structures/<int:structure_id>')
    @requires_auth('get:structures')
    def get_structure_by_id(current_user, structure_id):
        structure = Structure.query.filter_by(
            id=structure_id).one_or_none()
        if structure is None:
            abort(404)
        return jsonify({'success': True, 'data': structure.json()}), 200

    @app.route('/api/v1/structures/<string:name>')
    @requires_auth('get:structures')
    def get_structure_by_name(current_user, name):
        structures = Structure.query.filter(
            Structure.sturcture_name.ilike(f'%{name}%')).all()
        data = []
        for structure in structures:
            data.append(structure.json())
        return jsonify({'success': True, 'data': data}), 200

    @app.route('/api/v1/structures', methods=["POST"])
    @requires_auth('post:structures')
    def post_structures(current_user):
        data = request.get_json()
        arrondissement_id = data.get('arrondissement', None)
        is_validated = validate_structure(**data)
        if is_validated is not True:
            return jsonify({'success': False, 'message': 'Invalid data entry', 'error': is_validated}), 409
        arrondissement = Arrondissement.query.filter_by(
            id=arrondissement_id).one_or_none()
        if arrondissement is None:
            return jsonify({'success': False, 'error': 404, 'message': 'That arrondissement doesnt exist'}), 404
        try:
            structure = Structure(data)
            structure.insert()
            return jsonify({'success': True, 'data': structure.json()}), 201
        except:
            abort(500)

    @app.route('/api/v1/structures/<int:structure_id>', methods=["PUT"])
    @requires_auth('put:structures')
    def put_structures(current_user, structure_id):
        data = request.get_json()
        arrondissement_id = data.get('arrondissement', None)
        is_validated = validate_structure(**data)
        if is_validated is not True:
            return jsonify({'success': False, 'message': 'Invalid data entry', 'error': is_validated}), 409
        structure = Structure.query.filter_by(
            id=structure_id).one_or_none()
        if structure is None:
            return jsonify({'success': False, 'error': 404, 'message': 'That structure doesnt exist'}), 404
        arrondissement = Arrondissement.query.filter_by(
            id=arrondissement_id).one_or_none()
        if arrondissement is None:
            return jsonify({'success': False, 'error': 404, 'message': 'That arrondissement doesnt exist'}), 404
        try:
            structure.sturcture_name = data.get('name')
            structure.structure_adresse = data.get('adresse')
            structure.structure_contacts = data.get('contacts')
            structure.structure_form = data.get('form')
            structure.structure_language = data.get('language')
            structure.structure_ordre = data.get('ordre')
            structure.arrondissement_id = data.get('arrondissement')
            structure.update()
            return jsonify({'success': True, 'data': arrondissement.json()}), 200
        except:
            abort(500)

    @app.route('/api/v1/structures')
    @requires_auth('get:structures')
    def get_all_structures(current_user):
        structures = Structure.query.all()
        data = []
        for structure in structures:
            data.append(structure.json())
        return jsonify({'success': True, 'data': data}), 200

    @app.route('/api/v1/structures/<int:structure_id>', methods=["DELETE"])
    @requires_auth('delete:structures')
    def delete_structure_by_id(current_user, structure_id):
        structure = Structure.query.filter_by(
            id=structure_id).one_or_none()
        if structure is None:
            abort(404)
        try:
            structure.delete()
            return jsonify({'success': True, 'message': f'the structure with ID {structure_id} has been deleted'}), 200
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

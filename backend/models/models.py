from datetime import datetime, timedelta
from email.policy import default
from time import timezone
from operator import or_
from sqlalchemy import Column, String, Integer, Boolean, Text, func
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import check_password_hash

database_name = "decdevis"
database_path = "postgresql://postgres:OPBco@{}/{}".format(
    'localhost:5432', database_name)

db = SQLAlchemy()

'''
setup_db(app)
    binds a flask application and a SQLAlchemy service
'''


def setup_db(app, database_path=database_path):
    app.config["SQLALCHEMY_DATABASE_URI"] = database_path
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.app = app
    db.init_app(app)


'''
User
a persistent user entity, extends the base SQLAlchemy Model
'''


class User(db.Model):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    user_name = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role_id = Column(Integer, db.ForeignKey('roles.id'), nullable=False)
    active = Column(Boolean, nullable=False, default=True)

    """Get a active user by email"""
    @staticmethod
    def get_by_username_or_email(userdetail):
        return User.query.filter(or_(User.email == userdetail, User.user_name == userdetail), User.active == True).one_or_none()

    """Login a user"""
    @staticmethod
    def login(email, password):
        user = User.get_by_username_or_email(email)
        if user is None or not check_password_hash(user.password, password):
            return
        return {'exp': datetime.utcnow() + timedelta(minutes=30), 'userid': user.id, 'username': user.user_name, 'email': user.email, 'role_name': user.role.role_name, 'permissions': user.role.permissions}

    def short_repr(self):
        return {'userid': self.id, 'username': self.user_name, 'email': self.email, 'role_name': self.role.role_name, 'permissions': self.role.permissions}

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    def __repr__(self):
        return f'<User ID: {self.id} UserName: {self.user_name} Email: {self.email} >'


class Role(db.Model):
    __tablename__ = 'roles'
    id = Column(Integer, primary_key=True)
    role_name = Column(String, unique=True, nullable=False)
    role_description = Column(String, nullable=True)
    permissions = Column(db.ARRAY(String), nullable=False)
    users = db.relationship('User', backref='role', lazy=True)

    @classmethod
    def getByName(cls, _role):
        find = cls.query.filter_by(role_name=_role).first()
        return find

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    def __repr__(self):
        return f'<Role ID: {self.id} RoleName: {self.role_name} >'


class Region(db.Model):
    __tablename__ = 'regions'
    id = Column(Integer, primary_key=True)
    region_name = Column(String, unique=True, nullable=False)
    departements = db.relationship('Departement', backref='region', lazy=True)

    def json(self):
        return {'id': self.id, 'name': self.region_name}

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    def __repr__(self):
        return f'<Region ID: {self.id} Name: {self.region_name} >'


class Departement(db.Model):
    __tablename__ = 'departements'
    id = Column(Integer, primary_key=True)
    region_id = Column(Integer, db.ForeignKey('regions.id'), nullable=False)
    departement_name = Column(String, unique=True, nullable=False)
    arrondissements = db.relationship(
        'Arrondissement', backref='departement', lazy=True)

    def json(self):
        return {'id': self.id, 'name': self.departement_name, 'region': self.region.json()}

    def Shortjson(self):
        return {'id': self.id, 'name': self.departement_name}

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    def __repr__(self):
        return f'<Departement ID: {self.id} Name: {self.departement_name} >'


class Arrondissement(db.Model):
    __tablename__ = 'arrondissements'
    id = Column(Integer, primary_key=True)
    departement_id = Column(Integer, db.ForeignKey(
        'departements.id'), nullable=False)
    arrondissement_name = Column(String, nullable=False)
    structures = db.relationship(
        'Structure', backref='arrondissement', lazy=True)

    def json(self):
        return {'id': self.id, 'name': self.arrondissement_name, 'departement': self.departement.Shortjson(), 'region': self.departement.region.json()}

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    @classmethod
    def getByID(cls, _id):
        find = cls.query.filter_by(id=_id).one_or_none()
        return find

    def __repr__(self):
        return f'<Arrondissement ID: {self.id} Name: {self.arrondissement_name} >'


class Structure(db.Model):
    __tablename__ = 'structures'
    id = Column(Integer, primary_key=True)
    sturcture_name = Column(String, unique=True, nullable=False)
    structure_adresse = Column(String, nullable=True)
    structure_contacts = Column(String, nullable=False)
    structure_form = Column(db.Enum('GENERAL', 'TECHNIQUE', 'POLYVALENT', 'ENIEG', 'ENIET', name='formTypes'),
                            nullable=False, server_default='GENERAL')
    structure_ordre = Column(db.Enum('PRIVE CATHOLIQUE', 'PRIVE PROTESTANT', 'PRIVE LAIC', 'PRIVE ISLAMIQUE', 'PUBLIC', name='ordreTypes'),
                             nullable=False, server_default='PUBLIC')
    structure_language = Column(db.Enum('FRANCAIS', 'ANGLAIS', 'BILINGUE', name='languageTypes'),
                                nullable=False, server_default='BILINGUE')
    date_creation = Column(db.DateTime(timezone=True),
                           server_default=func.now())
    arrondissement_id = Column(Integer, db.ForeignKey(
        'arrondissements.id'), nullable=False)
    # Session Exam : relationship mamyTomany with Session through SessionCentre
    sessioncentres = db.relationship(
        'SessionCentre', backref='structure', lazy=True)

    def __init__(self, data) -> None:
        self.sturcture_name = data.get('name')
        self.structure_adresse = data.get('adresse')
        self.structure_contacts = data.get('contacts')
        self.structure_form = data.get('form')
        self.structure_language = data.get('language')
        self.structure_ordre = data.get('ordre')
        self.arrondissement_id = data.get('arrondissement')

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    def shortJson(self):
        return {'id': self.id, 'name': self.sturcture_name, 'adresse': self.structure_adresse, 'contacts': self.structure_contacts, 'forme': self.structure_form, 'ordre': self.structure_ordre, 'language': self.structure_language}

    def json(self):
        return {'id': self.id, 'name': self.sturcture_name, 'forme': self.structure_form, 'ordre': self.structure_ordre, 'language': self.structure_language, 'adresse': self.structure_adresse, 'contacts': self.structure_contacts, 'arrondissement': self.arrondissement.json()}

    @classmethod
    def getByID(cls, structure_id):
        structure = cls.query.filter_by(id=structure_id).one_or_none()
        return structure

    @classmethod
    def getByName(cls, name):
        structure = cls.query.filter_by(sturcture_name=name).one_or_none()
        return structure

    def __repr__(self):
        return f'<Structure ID: {self.id} Name: {self.sturcture_name} >'


class Exam(db.Model):
    __tablename__ = 'exams'
    id = Column(Integer, primary_key=True)
    exam_name = Column(String, nullable=False, unique=True)
    sessions = db.relationship('Session', backref='exam', lazy=True)

    def json(self):
        return {'id': self.id, 'name': self.exam_name}

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    @classmethod
    def getByID(cls, _id):
        find = cls.query.filter_by(id=_id).one_or_none()
        return find

    def __repr__(self):
        return f'<Exam ID: {self.id} Name: {self.exam_name} >'


class Session(db.Model):
    __tablename__ = 'sessions'
    id = Column(Integer, primary_key=True)
    session_name = Column(String, nullable=False, unique=True)
    exam_id = Column(Integer, db.ForeignKey(
        'exams.id', onupdate="CASCADE", ondelete="CASCADE"), nullable=False)
    nbr_subject_write = Column(Integer, db.CheckConstraint(
        'nbr_subject_write > 2'), nullable=False, default=2)
    # Structures : relationship mamyTomany with structure through SessionCentre
    sessioncentres = db.relationship(
        'SessionCentre', backref='session', lazy=True)

    def json(self):
        return {'id': self.id, 'name': self.session_name}

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    @classmethod
    def getByID(cls, _id):
        find = cls.query.filter_by(id=_id).one_or_none()
        return find

    def __repr__(self):
        return f'<Session ID: {self.id} Name: {self.session_name} >'


class SessionCentre(db.Model):
    __tablename__ = 'sessioncentres'
    session_id = Column(Integer, db.ForeignKey(
        'sessions.id', ondelete="CASCADE"), primary_key=True)
    structure_id = Column(Integer, db.ForeignKey(
        'structures.id', ondelete="CASCADE"), primary_key=True)
    form_centre = Column(db.Enum('C', 'CA', 'SC', 'SA', name='formsCentre'),
                         nullable=False, server_default='SC')
    type_centre = Column(db.Enum('E', 'EC', 'ECD', name='typesCentre'),
                         nullable=False, server_default='E')
    isForDisabled = Column(Boolean, nullable=False, default=False)
    nbr_candidat_ecrit = Column(Integer, db.CheckConstraint(
        'nbr_candidat_ecrit > 50'), nullable=False, default=200)
    nbr_copies_marked = Column(Integer, db.CheckConstraint(
        'nbr_copies_marked > 500'), nullable=True, default=200)
    nbr_candidat_delib = Column(Integer, db.CheckConstraint(
        'nbr_candidat_delib > 50'), nullable=True, default=200)
    nbr_candidat_oral = Column(Integer, db.CheckConstraint(
        'nbr_candidat_oral > 50'), nullable=True, default=200)

    def json(self):
        return {'id': self.id, 'name': self.session_id}

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self):
        db.session.commit()

    @classmethod
    def getByID(cls, _id):
        find = cls.query.filter_by(id=_id).one_or_none()
        return find

    def __repr__(self):
        return f'<Session ID: {self.id} Name: {self.session_name} >'

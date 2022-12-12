from ast import Num
from datetime import datetime, timedelta
from email.policy import default
from math import ceil
from time import timezone
from operator import or_
from sqlalchemy import Column, String, Integer, Boolean, Numeric, Float, func, create_engine
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.sql import text
from sqlalchemy.orm import validates
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

    def shortJson(self):
        return {'id': self.id, 'name': self.arrondissement_name}

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
        return {'id': self.id, 'name': self.sturcture_name, 'forme': self.structure_form, 'ordre': self.structure_ordre, 'language': self.structure_language, 'adresse': self.structure_adresse, 'contacts': self.structure_contacts, 'arrondissement': self.arrondissement.json(), 'departement': self.arrondissement.departement.Shortjson(), 'region': self.arrondissement.departement.region.json()}

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
    exam_code = Column(db.Enum('BEPC', 'CAP STT', 'CAPI', 'CAPIEPM', 'CAPIET', 'CONCOURS', name='examTypes'),
                       nullable=False, server_default='BEPC')
    sessions = db.relationship('Session', backref='exam', lazy=True)

    def json(self):
        return {'id': self.id, 'name': self.exam_name, 'code': self.exam_code}

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
    session_name = Column(String, nullable=False)
    exam_id = Column(Integer, db.ForeignKey(
        'exams.id', onupdate="CASCADE", ondelete="CASCADE"), nullable=False)
    nbr_subject_write = Column(Integer, db.CheckConstraint(
        'nbr_subject_write > 2'), nullable=False, default=2)
    # INDEMNITE CHEF CENTRE ECRIT
    indemnite_chef_centre_write = Column(Float, db.CheckConstraint(
        'indemnite_chef_centre_write > 40000'), nullable=True, server_default="75000")
    indemnite_chef_scentre_write = Column(Float, db.CheckConstraint(
        'indemnite_chef_scentre_write > 40000'), nullable=True, server_default="50000")
    indemnite_chef_centrea_write = Column(Float, db.CheckConstraint(
        'indemnite_chef_centrea_write > 40000'), nullable=True, server_default="125000")
    indemnite_chef_scentrea_write = Column(Float, db.CheckConstraint(
        'indemnite_chef_scentrea_write > 40000'), nullable=True, server_default="100000")
    # Vacation surveillances
    nbr_candidat_salle_write = Column(Integer, db.CheckConstraint(
        'nbr_candidat_salle_write > 0'), nullable=True, server_default="35")
    nbr_surveillant_salle_write = Column(Integer, db.CheckConstraint(
        'nbr_surveillant_salle_write > 0'), nullable=True, server_default="2")
    nbr_salle_surveillants_write = Column(Integer, db.CheckConstraint(
        'nbr_salle_surveillants_write > 0'), nullable=True, server_default="4")
    nbr_jour_examen_write = Column(Integer, db.CheckConstraint(
        'nbr_jour_examen_write > 0'), nullable=True, server_default="4")
    nbr_vaccation_jour_write = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_jour_write > 0'), nullable=True, server_default="2")
    taux_vaccation_surveillant_write = Column(Float, db.CheckConstraint(
        'taux_vaccation_surveillant_write > 1000'), nullable=True, server_default="1500")
    # vaccation surveillances handicapés
    nbr_surveillant_salle_hand_write = Column(Integer, db.CheckConstraint(
        'nbr_surveillant_salle_hand_write > 0'), nullable=True, server_default="2")
    nbr_vaccation_transcript_hand_write = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_transcript_hand_write > 0'), nullable=True, server_default="6")
    nbr_vaccation_deroulement_hand_write = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_deroulement_hand_write > 0'), nullable=True, server_default="6")
    nbr_candidat_salle_hand_write = Column(Integer, db.CheckConstraint(
        'nbr_candidat_salle_hand_write > 0'), nullable=True, server_default="35")
    indemnite_chef_atelier_hand_write = Column(Float, db.CheckConstraint(
        'indemnite_chef_atelier_hand_write > 10000'), nullable=True, server_default="35000")
    taux_vaccation_surveillant_hand_write = Column(Float, db.CheckConstraint(
        'taux_vaccation_surveillant_hand_write > 1000'), nullable=True, server_default="1500")
    # Vaccation jury oral
    nbr_candidat_atelier_oral = Column(Integer, db.CheckConstraint(
        'nbr_candidat_atelier_oral > 0'), nullable=True, server_default="16")
    nbr_matiere_atelier_oral = Column(Integer, db.CheckConstraint(
        'nbr_matiere_atelier_oral > 0'), nullable=True, server_default="1")
    nbr_membre_atelier_oral = Column(Integer, db.CheckConstraint(
        'nbr_membre_atelier_oral > 0'), nullable=True, server_default="2")
    nbr_vaccation_membre_oral = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_membre_oral > 0'), nullable=True, server_default="2")
    taux_vaccation_surveillant_oral = Column(Float, db.CheckConstraint(
        'taux_vaccation_surveillant_oral > 1000'), nullable=True, server_default="1500")
    indemnite_chef_salle_oral = Column(Float, db.CheckConstraint(
        'indemnite_chef_salle_oral > 10000'), nullable=True, server_default="35000")
    # Vaccation Sécrétariat et indemnité chef sécrétariat
    nbr_vaccation_jour_sec_write = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_jour_sec_write > 0'), nullable=True, server_default="3")
    nbr_vaccation_sec_correct = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_sec_correct > 0'), nullable=True, server_default="5")
    nbr_vaccation_sec_delib = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_sec_delib > 0'), nullable=True, server_default="10")
    taux_vaccation_sec = Column(Float, db.CheckConstraint(
        'taux_vaccation_sec > 1000'), nullable=True, server_default="1500")
    indemnite_chef_sec = Column(Float, db.CheckConstraint(
        'indemnite_chef_sec > 10000'), nullable=True, server_default="40000")
    indemnite_chef_sec_all = Column(Float, db.CheckConstraint(
        'indemnite_chef_sec_all > 10000'), nullable=True, server_default="50000")
    nbr_jour_examen_pratique = Column(Integer, db.CheckConstraint(
        'nbr_jour_examen_pratique > 0'), nullable=True, server_default="1")
    # Chargé de mission
    taux_vaccation_cm = Column(Float, db.CheckConstraint(
        'taux_vaccation_cm > 1000'), nullable=True, server_default="1500")
    indemnite_cm = Column(Float, db.CheckConstraint(
        'indemnite_cm > 10000'), nullable=True, server_default="65000")
    # Vaccation correction et indemnité chef de salle
    nbr_matiere_correct = Column(Integer, db.CheckConstraint(
        'nbr_matiere_correct > 0'), nullable=True, server_default="11")
    taux_copie_correct = Column(Float, db.CheckConstraint(
        'taux_copie_correct > 90'), nullable=True, server_default="100")
    indemnite_chef_salle_correct = Column(Float, db.CheckConstraint(
        'indemnite_chef_salle_correct > 10000'), nullable=True, server_default="35000")
    # Vaccation et Indemnité délibérations
    nbr_candidat_jury_delib = Column(Integer, db.CheckConstraint(
        'nbr_candidat_jury_delib > 0'), nullable=True, server_default="750")
    nbr_membre_lecteur_delib = Column(Integer, db.CheckConstraint(
        'nbr_membre_lecteur_delib > 0'), nullable=True, server_default="9")
    nbr_membre_teneur_delib = Column(Integer, db.CheckConstraint(
        'nbr_membre_teneur_delib > 0'), nullable=True, server_default="2")
    nbr_vaccation_teneur_delib = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_teneur_delib > 0'), nullable=True, server_default="10")
    nbr_vaccation_lecteur_delib = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_lecteur_delib > 0'), nullable=True, server_default="7")
    taux_vaccation_membre_delib = Column(Float, db.CheckConstraint(
        'taux_vaccation_membre_delib > 1000'), nullable=True, server_default="1500")
    indemnite_president_jury_delib = Column(Float, db.CheckConstraint(
        'indemnite_president_jury_delib > 50000'), nullable=True, server_default="85000")
    indemnite_vpresident_jury_delib = Column(Float, db.CheckConstraint(
        'indemnite_vpresident_jury_delib > 35000'), nullable=True, server_default="40000")
    # Vaccation dispatching
    nbr_vaccation_prepa_dispatch = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_prepa_dispatch > 0'), nullable=True, server_default="2")
    nbr_vaccation_awrite_dispatch = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_awrite_dispatch > 0'), nullable=True, server_default="14")
    nbr_vaccation_acorrect_dispatch = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_acorrect_dispatch > 0'), nullable=True, server_default="6")
    nbr_vaccation_adelib_dispatch = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_adelib_dispatch > 0'), nullable=True, server_default="14")
    taux_vaccation_membre_dispatch = Column(Float, db.CheckConstraint(
        'taux_vaccation_membre_dispatch > 1000'), nullable=True, server_default="1500")
    indemnite_chef_sec_dispacth = Column(Float, db.CheckConstraint(
        'indemnite_chef_sec_dispacth > 40000'), nullable=True, server_default="50000")
    # Vaccation jury harmonisation des corrigés
    nbr_vaccation_responsable_harmo = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_responsable_harmo > 0'), nullable=True, server_default="5")
    nbr_vaccation_membre_harmo = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_membre_harmo > 0'), nullable=True, server_default="3")
    nbr_membre_jury_harmo = Column(Integer, db.CheckConstraint(
        'nbr_membre_jury_harmo > 0'), nullable=True, server_default="2")
    taux_vaccation_harmo = Column(Float, db.CheckConstraint(
        'taux_vaccation_harmo > 1000'), nullable=True, server_default="1500")
    # Correction CGAO/GSO
    taux_correction_cgao_gso = Column(Float, db.CheckConstraint(
        'taux_correction_cgao_gso > 100'), nullable=True, server_default="100")
    # chef atelier pratique
    indemnite_chef_atelier_pratique = Column(Float, db.CheckConstraint(
        'indemnite_chef_atelier_pratique > 35000'), nullable=True, server_default="35000")
    # Matières d'oeuvre
    taux_preparation_atelier_candidat = Column(Float, db.CheckConstraint(
        'taux_preparation_atelier_candidat > 100'), nullable=True, server_default="150")
    taux_matiere_oeuvre_esf_candidat = Column(Float, db.CheckConstraint(
        'taux_matiere_oeuvre_esf_candidat > 5000'), nullable=True, server_default="6500")
    taux_matiere_oeuvre_stt_candidat = Column(Float, db.CheckConstraint(
        'taux_matiere_oeuvre_stt_candidat > 5000'), nullable=True, server_default="3500")
    # Pratique ESF
    taux_vaccation_examinateur_pratique = Column(Float, db.CheckConstraint(
        'taux_vaccation_examinateur_pratique > 1000'), nullable=True, server_default="1500")
    nbr_examinateur_atelier_pratique = Column(Integer, db.CheckConstraint(
        'nbr_examinateur_atelier_pratique > 0'), nullable=True, server_default="2")
    # Structures : relationship mamyTomany with structure through SessionCentre
    sessioncentres = db.relationship(
        'SessionCentre', backref='session', lazy=True)

    def edit(self, data):
        self.indemnite_chef_centre_write = data["indemnite_chef_centre_write"]
        self.indemnite_chef_scentre_write = data["indemnite_chef_scentre_write"]
        self.indemnite_chef_centrea_write = data["indemnite_chef_centrea_write"]
        self.indemnite_chef_scentrea_write = data["indemnite_chef_scentrea_write"]
        self.nbr_candidat_salle_write = data["nbr_candidat_salle_write"]
        self.nbr_surveillant_salle_write = data["nbr_surveillant_salle_write"]
        self.nbr_salle_surveillants_write = data["nbr_salle_surveillants_write"]
        self.nbr_jour_examen_write = data["nbr_jour_examen_write"]
        self.nbr_vaccation_jour_write = data["nbr_vaccation_jour_write"]
        self.taux_vaccation_surveillant_write = data["taux_vaccation_surveillant_write"]
        self.nbr_surveillant_salle_hand_write = data["nbr_surveillant_salle_hand_write"]
        self.nbr_vaccation_transcript_hand_write = data["nbr_vaccation_transcript_hand_write"]
        self.nbr_vaccation_deroulement_hand_write = data["nbr_vaccation_deroulement_hand_write"]
        self.nbr_candidat_salle_hand_write = data["nbr_candidat_salle_hand_write"]
        self.indemnite_chef_atelier_hand_write = data["indemnite_chef_atelier_hand_write"]
        self.taux_vaccation_surveillant_hand_write = data["taux_vaccation_surveillant_hand_write"]
        self.nbr_candidat_atelier_oral = data["nbr_candidat_atelier_oral"]
        self.nbr_matiere_atelier_oral = data["nbr_matiere_atelier_oral"]
        self.nbr_membre_atelier_oral = data["nbr_membre_atelier_oral"]
        self.nbr_vaccation_membre_oral = data["nbr_vaccation_membre_oral"]
        self.taux_vaccation_surveillant_oral = data["taux_vaccation_surveillant_oral"]
        self.indemnite_chef_salle_oral = data["indemnite_chef_salle_oral"]
        self.nbr_vaccation_jour_sec_write = data["nbr_vaccation_jour_sec_write"]
        self.nbr_vaccation_sec_correct = data["nbr_vaccation_sec_correct"]
        self.nbr_vaccation_sec_delib = data["nbr_vaccation_sec_delib"]
        self.taux_vaccation_sec = data["taux_vaccation_sec"]
        self.indemnite_chef_sec = data["indemnite_chef_sec"]
        self.indemnite_chef_sec_all = data["indemnite_chef_sec_all"]
        self.nbr_jour_examen_pratique = data["nbr_jour_examen_pratique"]
        self.taux_vaccation_cm = data["taux_vaccation_cm"]
        self.indemnite_cm = data["indemnite_cm"]
        self.nbr_matiere_correct = data["nbr_matiere_correct"]
        self.taux_copie_correct = data["taux_copie_correct"]
        self.indemnite_chef_salle_correct = data["indemnite_chef_salle_correct"]
        self.nbr_candidat_jury_delib = data["nbr_candidat_jury_delib"]
        self.nbr_membre_lecteur_delib = data["nbr_membre_lecteur_delib"]
        self.nbr_membre_teneur_delib = data["nbr_membre_teneur_delib"]
        self.nbr_vaccation_teneur_delib = data["nbr_vaccation_teneur_delib"]
        self.nbr_vaccation_lecteur_delib = data["nbr_vaccation_lecteur_delib"]
        self.taux_vaccation_membre_delib = data["taux_vaccation_membre_delib"]
        self.indemnite_president_jury_delib = data["indemnite_president_jury_delib"]
        self.indemnite_vpresident_jury_delib = data["indemnite_vpresident_jury_delib"]
        self.nbr_vaccation_prepa_dispatch = data["nbr_vaccation_prepa_dispatch"]
        self.nbr_vaccation_awrite_dispatch = data["nbr_vaccation_awrite_dispatch"]
        self.nbr_vaccation_acorrect_dispatch = data["nbr_vaccation_acorrect_dispatch"]
        self.nbr_vaccation_adelib_dispatch = data["nbr_vaccation_adelib_dispatch"]
        self.taux_vaccation_membre_dispatch = data["taux_vaccation_membre_dispatch"]
        self.indemnite_chef_sec_dispacth = data["indemnite_chef_sec_dispacth"]
        self.nbr_vaccation_responsable_harmo = data["nbr_vaccation_responsable_harmo"]
        self.nbr_vaccation_membre_harmo = data["nbr_vaccation_membre_harmo"]
        self.nbr_membre_jury_harmo = data["nbr_membre_jury_harmo"]
        self.taux_vaccation_harmo = data["taux_vaccation_harmo"]
        self.taux_correction_cgao_gso = data["taux_correction_cgao_gso"]
        self.indemnite_chef_atelier_pratique = data["indemnite_chef_atelier_pratique"]
        self.taux_preparation_atelier_candidat = data["taux_preparation_atelier_candidat"]
        self.taux_matiere_oeuvre_esf_candidat = data["taux_matiere_oeuvre_esf_candidat"]
        self.taux_matiere_oeuvre_stt_candidat = data["taux_matiere_oeuvre_stt_candidat"]
        self.taux_vaccation_examinateur_pratique = data["taux_vaccation_examinateur_pratique"]
        self.nbr_examinateur_atelier_pratique = data["nbr_examinateur_atelier_pratique"]
        db.session.commit()

    def ShortJson(self):
        return {
            'id': self.id,
            'name': self.session_name,
            "exam": self.exam.json(),
        }

    def json(self):
        return {
            'id': self.id,
            'name': self.session_name,
            "exam": self.exam.json(),
            "nbr_subject_write": self.nbr_subject_write,
            "indemnite_chef_centre_write": self.indemnite_chef_centre_write,
            "indemnite_chef_scentre_write": self.indemnite_chef_scentre_write,
            "indemnite_chef_centrea_write": self.indemnite_chef_centrea_write,
            "indemnite_chef_scentrea_write": self.indemnite_chef_scentrea_write,
            "nbr_candidat_salle_write": self.nbr_candidat_salle_write,
            "nbr_surveillant_salle_write": self.nbr_surveillant_salle_write,
            "nbr_salle_surveillants_write": self.nbr_salle_surveillants_write,
            "nbr_jour_examen_write": self.nbr_jour_examen_write,
            "nbr_vaccation_jour_write": self.nbr_vaccation_jour_write,
            "taux_vaccation_surveillant_write": self.taux_vaccation_surveillant_write,
            "nbr_surveillant_salle_hand_write": self.nbr_surveillant_salle_hand_write,
            "nbr_vaccation_transcript_hand_write": self.nbr_vaccation_transcript_hand_write,
            "nbr_vaccation_deroulement_hand_write": self.nbr_vaccation_deroulement_hand_write,
            "nbr_candidat_salle_hand_write": self.nbr_candidat_salle_hand_write,
            "indemnite_chef_atelier_hand_write": self.indemnite_chef_atelier_hand_write,
            "taux_vaccation_surveillant_hand_write": self.taux_vaccation_surveillant_hand_write,
            "nbr_candidat_atelier_oral": self.nbr_candidat_atelier_oral,
            "nbr_matiere_atelier_oral": self.nbr_matiere_atelier_oral,
            "nbr_membre_atelier_oral": self.nbr_membre_atelier_oral,
            "nbr_vaccation_membre_oral": self.nbr_vaccation_membre_oral,
            "taux_vaccation_surveillant_oral": self.taux_vaccation_surveillant_oral,
            "indemnite_chef_salle_oral": self.indemnite_chef_salle_oral,
            "nbr_vaccation_jour_sec_write": self.nbr_vaccation_jour_sec_write,
            "nbr_vaccation_sec_correct": self.nbr_vaccation_sec_correct,
            "nbr_vaccation_sec_delib": self.nbr_vaccation_sec_delib,
            "taux_vaccation_sec": self.taux_vaccation_sec,
            "indemnite_chef_sec": self.indemnite_chef_sec,
            "indemnite_chef_sec_all": self.indemnite_chef_sec_all,
            "nbr_jour_examen_pratique": self.nbr_jour_examen_pratique,
            "taux_vaccation_cm": self.taux_vaccation_cm,
            "indemnite_cm": self.indemnite_cm,
            "nbr_matiere_correct": self.nbr_matiere_correct,
            "taux_copie_correct": self.taux_copie_correct,
            "indemnite_chef_salle_correct": self.indemnite_chef_salle_correct,
            "nbr_candidat_jury_delib": self.nbr_candidat_jury_delib,
            "nbr_membre_lecteur_delib": self.nbr_membre_lecteur_delib,
            "nbr_membre_teneur_delib": self.nbr_membre_teneur_delib,
            "nbr_vaccation_teneur_delib": self.nbr_vaccation_teneur_delib,
            "nbr_vaccation_lecteur_delib": self.nbr_vaccation_lecteur_delib,
            "taux_vaccation_membre_delib": self.taux_vaccation_membre_delib,
            "indemnite_president_jury_delib": self.indemnite_president_jury_delib,
            "indemnite_vpresident_jury_delib": self.indemnite_vpresident_jury_delib,
            "nbr_vaccation_prepa_dispatch": self.nbr_vaccation_prepa_dispatch,
            "nbr_vaccation_awrite_dispatch": self.nbr_vaccation_awrite_dispatch,
            "nbr_vaccation_acorrect_dispatch": self.nbr_vaccation_acorrect_dispatch,
            "nbr_vaccation_adelib_dispatch": self.nbr_vaccation_adelib_dispatch,
            "taux_vaccation_membre_dispatch": self.taux_vaccation_membre_dispatch,
            "indemnite_chef_sec_dispacth": self.indemnite_chef_sec_dispacth,
            "nbr_vaccation_responsable_harmo": self.nbr_vaccation_responsable_harmo,
            "nbr_vaccation_membre_harmo": self.nbr_vaccation_membre_harmo,
            "nbr_membre_jury_harmo": self.nbr_membre_jury_harmo,
            "taux_vaccation_harmo": self.taux_vaccation_harmo,
            "taux_correction_cgao_gso": self.taux_correction_cgao_gso,
            "indemnite_chef_atelier_pratique": self.indemnite_chef_atelier_pratique,
            "taux_preparation_atelier_candidat": self.taux_preparation_atelier_candidat,
            "taux_matiere_oeuvre_esf_candidat": self.taux_matiere_oeuvre_esf_candidat,
            "taux_matiere_oeuvre_stt_candidat": self.taux_matiere_oeuvre_stt_candidat,
            "taux_vaccation_examinateur_pratique": self.taux_vaccation_examinateur_pratique,
            "nbr_examinateur_atelier_pratique": self.nbr_examinateur_atelier_pratique
        }

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    @classmethod
    def getByID(cls, _id):
        find = cls.query.filter_by(id=_id).one_or_none()
        return find

    def __repr__(self):
        return f'<Session ID: {self.id} Name: {self.session_name} Exam: {self.exam_id}  >'


class SessionCentre(db.Model):
    __tablename__ = 'sessioncentres'
    id = Column(Integer, primary_key=True)
    session_id = Column(Integer, db.ForeignKey(
        'sessions.id', ondelete="CASCADE"), nullable=False)
    structure_id = Column(Integer, db.ForeignKey(
        'structures.id', ondelete="CASCADE"), nullable=False)
    form_centre = Column(db.Enum('C', 'CA', 'SC', 'SA', name='formsCentre'),
                         nullable=False, server_default='SC')
    type_centre = Column(db.Enum('E', 'EC', 'ECD', 'EP', 'EPC', 'EPCD', name='typesCentre'),
                         nullable=False, server_default='E')
    isForDisabled = Column(Boolean, nullable=False, server_default='False')
    isForOral = Column(Boolean, nullable=False, server_default='False')
    isForHarmo = Column(Boolean, nullable=False, server_default='False')
    nbr_candidat_ecrit = Column(Integer, db.CheckConstraint(
        'nbr_candidat_ecrit > 0'), nullable=True, server_default='10')
    nbr_matiere = Column(Integer, db.CheckConstraint(
        'nbr_matiere > 0'), nullable=True, server_default='0')
    nbr_candidat_handicap = Column(Integer, db.CheckConstraint(
        'nbr_candidat_handicap > 0'), nullable=True, server_default='0')
    nbr_copies_marked = Column(Integer, db.CheckConstraint(
        'nbr_copies_marked > 0'), nullable=True, server_default='0')
    nbr_candidat_marked = Column(Integer, db.CheckConstraint(
        'nbr_candidat_marked > 0'), nullable=True, server_default='0')
    nbr_candidat_delib = Column(Integer, db.CheckConstraint(
        'nbr_candidat_delib > 0'), nullable=True, server_default='0')
    nbr_candidat_oral = Column(Integer, db.CheckConstraint(
        'nbr_candidat_oral > 0'), nullable=True, server_default='0')
    nbr_candidat_epreuve_facultive = Column(Integer, db.CheckConstraint(
        'nbr_candidat_epreuve_facultive > 0'), nullable=True, server_default='0')
    nbr_candidat_inapte = Column(Integer, db.CheckConstraint(
        'nbr_candidat_inapte > 0'), nullable=True, server_default='0')
    centre_id = Column(Integer, db.ForeignKey(
        'sessioncentres.id', onupdate="CASCADE", ondelete="CASCADE"), nullable=True, index=True)
    sub_centre = db.relationship(
        "SessionCentre", backref=db.backref("centre", remote_side=[id]))
    # frais d'organisation
    frais_organisation = Column(Float, nullable=True, server_default="0")
    # vaccation surveillance
    vaccation_surveillance = Column(Float, nullable=True, server_default="0")
    # indemnite_chefcentre
    indemnite_chefcentre = Column(Float, nullable=True, server_default="0")
    # nombre de sous-atelier
    nbr_sous_atelier_oral = Column(Integer, db.CheckConstraint(
        'nbr_sous_atelier_oral > 0'), nullable=True, server_default='0')
    # indemnité chef salle sous-atelier
    indemnite_chef_sous_atelier_oral = Column(Float, db.CheckConstraint(
        'indemnite_chef_sous_atelier_oral > 0'), nullable=True, server_default='0')
    # membre sécrétariat
    nbr_membre_sec = Column(Integer, db.CheckConstraint(
        'nbr_membre_sec > 0'), nullable=True, server_default='0')
    nbr_vaccation_aecrit_sec = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_aecrit_sec > 0'), nullable=True, server_default='0')
    nbr_vaccation_ecrit_sec = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_ecrit_sec > 0'), nullable=True, server_default='0')
    nbr_vaccation_apecrit_sec = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_apecrit_sec > 0'), nullable=True, server_default='0')
    nbr_vaccation_correct_sec = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_correct_sec > 0'), nullable=True, server_default='0')
    nbr_vaccation_delib_sec = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_delib_sec > 0'), nullable=True, server_default='0')
    indemnite_chef_sec = Column(Float, db.CheckConstraint(
        'indemnite_chef_sec > 0'), nullable=True, server_default='0')
    # chargé de mission
    nbr_vaccation_cm = Column(Integer, db.CheckConstraint(
        'nbr_vaccation_cm > 0'), nullable=True, server_default='0')
    indemnite_cm = Column(Float, db.CheckConstraint(
        'indemnite_cm > 0'), nullable=True, server_default='0')
    # montant frais de correction
    montant_frais_corec = Column(Float, db.CheckConstraint(
        'montant_frais_corec > 0'), nullable=True, server_default='0')
    nombre_chef_salle_corec = Column(Float, db.CheckConstraint(
        'nombre_chef_salle_corec > 0'), nullable=True, server_default='0')
    nombre_jury_delib = Column(Float, db.CheckConstraint(
        'nombre_jury_delib > 0'), nullable=True, server_default='0')

    def Shortjson(self):
        return {
            'id': self.id,
            'session': self.session.ShortJson(),
            'structure': self.structure.json(),
            'form': self.form_centre,
            'type': self.type_centre,
            'for_disabled': self.isForDisabled,
            'for_oral': self.isForOral,
            'nbr_candidat_ecrit': self.nbr_candidat_ecrit,
            'nbr_candidat_handicap': self.nbr_candidat_handicap,
            'nbr_copies_marked': self.nbr_copies_marked,
            'nbr_matiere': self.nbr_matiere,
            'nbr_candidat_marked': self.nbr_candidat_marked,
            'nbr_candidat_delib': self.nbr_candidat_delib,
            'nbr_candidat_oral': self.nbr_candidat_oral,
            'nbr_candidat_epreuve_facultive': self.nbr_candidat_epreuve_facultive,
            'nbr_candidat_inapte': self.nbr_candidat_inapte
        }

    def orgJson(self):
        return {
            'region': self.structure.arrondissement.departement.region.region_name,
            'departement': self.structure.arrondissement.departement.departement_name,
            'centre': self.centre.structure.sturcture_name if self.centre_id else self.structure.sturcture_name,
            'scentre': self.structure.sturcture_name,
            'form': self.form_centre,
            'effectif': self.nbr_candidat_ecrit,
            'frais': SessionCentre.get_frais_org(int(self.nbr_candidat_ecrit)),
        }

    def handJson(self):
        nb_salle_hand = ceil(self.nbr_candidat_handicap /
                             self.session.nbr_candidat_salle_hand_write)
        nb_membre = nb_salle_hand * self.session.nbr_surveillant_salle_hand_write
        total = nb_membre * (self.session.nbr_vaccation_transcript_hand_write +
                             self.session.nbr_vaccation_deroulement_hand_write) * self.session.taux_vaccation_surveillant_hand_write
        return {
            'region': self.structure.arrondissement.departement.region.region_name,
            'departement': self.structure.arrondissement.departement.departement_name,
            'centre': self.centre.structure.sturcture_name if self.centre_id else self.structure.sturcture_name,
            'scentre': self.structure.sturcture_name,
            'effectif': self.nbr_candidat_handicap,
            'nb_salle': nb_salle_hand,
            'nb_membre': self.session.nbr_surveillant_salle_hand_write,
            'nb_vac_transc': self.session.nbr_vaccation_transcript_hand_write,
            'nb_vac_deroul': self.session.nbr_vaccation_deroulement_hand_write,
            'indemnite': self.session.indemnite_chef_atelier_hand_write,
            'taux_vac': self.session.taux_vaccation_surveillant_hand_write,
            'total': total + self.session.indemnite_chef_atelier_hand_write,
        }

    def vacOralJson(self):
        nb_sous_atelier = ceil(self.nbr_candidat_oral /
                               self.session.nbr_candidat_atelier_oral)
        nombre_total_membre = nb_sous_atelier * self.session.nbr_membre_atelier_oral
        total_vac = nombre_total_membre * self.session.nbr_vaccation_membre_oral
        montant = self.session.taux_vaccation_surveillant_oral * total_vac
        return {
            'region': self.structure.arrondissement.departement.region.region_name,
            'departement': self.structure.arrondissement.departement.departement_name,
            'centre': self.centre.structure.sturcture_name if self.centre_id else self.structure.sturcture_name,
            'scentre': self.structure.sturcture_name,
            'effectif': self.nbr_candidat_oral,
            'nb_sous_atelier': nb_sous_atelier,
            'nb_matiere_oral': self.session.nbr_matiere_atelier_oral,
            'nb_vac_membre': self.session.nbr_vaccation_membre_oral,
            'nombre_total_membre': nombre_total_membre,
            'total_vac': total_vac,
            'taux_vac': self.session.taux_vaccation_surveillant_oral,
            'montant': montant,
            'indemnite': self.session.indemnite_chef_salle_oral,
            'total': montant + self.session.indemnite_chef_salle_oral
        }

    def delibJson(self):
        nbr_jury = self.nbr_candidat_delib // self.session.nbr_candidat_jury_delib
        total_vac_jury = (self.session.nbr_membre_lecteur_delib * self.session.nbr_vaccation_lecteur_delib) + \
            (self.session.nbr_vaccation_teneur_delib *
             self.session.nbr_membre_teneur_delib)
        montant_indemnite = nbr_jury * \
            (self.session.indemnite_president_jury_delib +
             self.session.indemnite_vpresident_jury_delib)
        montant_vacc = total_vac_jury * self.session.taux_vaccation_membre_delib * nbr_jury
        return {
            'region': self.structure.arrondissement.departement.region.region_name,
            'departement': self.structure.arrondissement.departement.departement_name,
            'centre': self.centre.structure.sturcture_name if self.centre_id else self.structure.sturcture_name,
            'scentre': self.structure.sturcture_name,
            'form': self.form_centre,
            'effectif': self.nbr_candidat_delib,
            'nbr_jury': nbr_jury,
            'nbr_membre_lec': self.session.nbr_membre_lecteur_delib,
            'vac_membre_lec': self.session.nbr_vaccation_lecteur_delib,
            'nbr_membre_ten': self.session.nbr_membre_teneur_delib,
            'vac_membre_ten': self.session.nbr_vaccation_teneur_delib,
            'total_vac_jury': total_vac_jury,
            'taux_vac_jury': self.session.taux_vaccation_membre_delib,
            'montant_vac_jury': montant_vacc,
            'nbr_pr_jury': nbr_jury,
            'indemnite_pr_jury': self.session.indemnite_president_jury_delib,
            'nbr_vpr_jury': nbr_jury,
            'indemnite_vpr_jury': self.session.indemnite_vpresident_jury_delib,
            'montant_indemnite': montant_indemnite,
            'total': montant_vacc + montant_indemnite
        }

    def secJson(self):
        nbr_membre_sec = SessionCentre.get_nbr_membre_sec(
            self.nbr_candidat_ecrit, self.session)
        nbr_vaccation_aecrit_sec = SessionCentre.get_vacc_membre_sec_ae(
            self.nbr_candidat_ecrit)
        nbr_vaccation_ecrit_sec = self.session.nbr_vaccation_jour_sec_write * \
            self.session.nbr_jour_examen_write
        nbr_vaccation_apecrit_sec = SessionCentre.get_vacc_membre_sec_ae(
            self.nbr_candidat_ecrit)
        nbr_vaccation_correct_sec = self.session.nbr_vaccation_sec_correct if "C" in self.type_centre else 0
        nbr_vaccation_delib_sec = self.session.nbr_vaccation_sec_delib if "D" in self.type_centre else 0
        indemnite_chef_sec = self.session.indemnite_chef_sec_all if "D" in self.type_centre else self.session.indemnite_chef_sec
        montant = nbr_membre_sec * (nbr_vaccation_aecrit_sec + nbr_vaccation_ecrit_sec + nbr_vaccation_apecrit_sec +
                                    nbr_vaccation_correct_sec + nbr_vaccation_delib_sec) * self.session.taux_vaccation_sec
        total = indemnite_chef_sec + montant
        nbr_vac_cm = nbr_vaccation_aecrit_sec + nbr_vaccation_ecrit_sec + \
            nbr_vaccation_apecrit_sec + nbr_vaccation_correct_sec * 2 + nbr_vaccation_delib_sec

        return {
            'region': self.structure.arrondissement.departement.region.region_name,
            'departement': self.structure.arrondissement.departement.departement_name,
            'centre': self.centre.structure.sturcture_name if self.centre_id else self.structure.sturcture_name,
            'scentre': self.structure.sturcture_name,
            'form': self.form_centre,
            'status': self.type_centre,
            'effectif': self.nbr_candidat_ecrit,
            'nbr_membre_sec': nbr_membre_sec,
            'nbr_vaccation_aecrit_sec': nbr_vaccation_aecrit_sec,
            'nbr_vaccation_ecrit_sec': nbr_vaccation_ecrit_sec,
            'nbr_vaccation_apecrit_sec': nbr_vaccation_apecrit_sec,
            'nbr_vaccation_correct_sec': nbr_vaccation_correct_sec,
            'nbr_vaccation_correct_cm': nbr_vaccation_correct_sec * 2,
            'nbr_vaccation_delib_sec': nbr_vaccation_delib_sec,
            'taux_vaccation_sec': self.session.taux_vaccation_sec,
            'total_membre_sec': montant,
            'indemnite_chef_sec': indemnite_chef_sec,
            'montant': total,
            'nbr_vaccation_cm': nbr_vac_cm,
            'taux_vaccation_cm': self.session.taux_vaccation_cm,
            'montant_vacc_cm': nbr_vac_cm * self.session.taux_vaccation_cm,
            'indemnite_cm': self.session.indemnite_cm,
            'total_cm': (nbr_vac_cm * self.session.taux_vaccation_cm) + self.session.indemnite_cm
        }

    def ccsJson(self):
        return {
            'region': self.structure.arrondissement.departement.region.region_name,
            'departement': self.structure.arrondissement.departement.departement_name,
            'centre': self.centre.structure.sturcture_name if self.centre_id else self.structure.sturcture_name,
            'scentre': self.structure.sturcture_name,
            'form': self.form_centre,
            'indemnite': SessionCentre.get_indemnite_sec(self.form_centre, self.session),
        }

    def corrJson(self):
        nbr_chef_salle = self.session.nbr_matiere_correct if "C" in self.type_centre else 0
        nbr_copies = self.nbr_candidat_marked * self.session.nbr_matiere_correct
        montant = (self.nbr_candidat_epreuve_facultive +
                   self.nbr_candidat_inapte + nbr_copies) * self.session.taux_copie_correct
        total = montant + (nbr_chef_salle *
                           self.session.indemnite_chef_salle_correct)
        return {
            'region': self.structure.arrondissement.departement.region.region_name,
            'departement': self.structure.arrondissement.departement.departement_name,
            'centre': self.centre.structure.sturcture_name if self.centre_id else self.structure.sturcture_name,
            'scentre': self.structure.sturcture_name,
            'form': self.form_centre,
            'status': self.type_centre,
            'effectif': self.nbr_candidat_ecrit,
            'copies_epreuve_facult': self.nbr_candidat_epreuve_facultive,
            'nbr_candidat_eps': self.nbr_candidat_inapte,
            'nbr_copies_correct': nbr_copies,
            'taux_correct_copie': self.session.taux_copie_correct,
            'montant': montant,
            'nbr_chef_salle': nbr_chef_salle,
            'indemnite_chef_salle': self.session.indemnite_chef_salle_correct,
            'total': total
        }

    def vaccseJson(self):
        nbsalle = ceil(self.nbr_candidat_ecrit /
                       self.session.nbr_candidat_salle_write)
        nbsurveil = nbsalle * self.session.nbr_surveillant_salle_write
        nbsurvsal = nbsalle // self.session.nbr_salle_surveillants_write
        nbvacc = self.session.nbr_vaccation_jour_write * \
            self.session.nbr_jour_examen_write
        return {
            'region': self.structure.arrondissement.departement.region.region_name,
            'departement': self.structure.arrondissement.departement.departement_name,
            'centre': self.centre.structure.sturcture_name if self.centre_id else self.structure.sturcture_name,
            'scentre': self.structure.sturcture_name,
            'form': self.form_centre,
            'type': self.type_centre,
            'effectif': self.nbr_candidat_ecrit,
            'nbr_salle': nbsalle,
            'nbr_surv_salle': nbsurveil,
            'nbr_surv_surv': nbsurvsal,
            'nbr_vaccation': nbvacc,
            'taux_vaccation': self.session.taux_vaccation_surveillant_write,
            'montant': (nbsurveil+nbsurvsal) * nbvacc * self.session.taux_vaccation_surveillant_write,
        }

    def json(self):
        return {
            'id': self.id,
            'session': self.session.ShortJson(),
            'structure': self.structure.shortJson(),
            'region': self.structure.arrondissement.departement.region.json(),
            'departement': self.structure.arrondissement.departement.json(),
            'arrondissement': self.structure.arrondissement.json(),
            'centre': self.centre.Shortjson() if self.centre_id else self.Shortjson(),
            'form': self.form_centre,
            'type': self.type_centre,
            'for_disabled': self.isForDisabled,
            'for_oral': self.isForOral,
            'for_harmo': self.isForHarmo,
            'nbr_matiere': self.nbr_matiere,
            'nbr_candidat_ecrit': self.nbr_candidat_ecrit,
            'nbr_candidat_handicap': self.nbr_candidat_handicap,
            'nbr_copies_marked': self.nbr_copies_marked,
            'nbr_candidat_marked': self.nbr_candidat_marked,
            'nbr_candidat_delib': self.nbr_candidat_delib,
            'nbr_candidat_oral': self.nbr_candidat_oral,
            'nbr_candidat_epreuve_facultive': self.nbr_candidat_epreuve_facultive,
            'nbr_candidat_inapte': self.nbr_candidat_inapte,
            'frais_organisation': SessionCentre.get_frais_org(int(self.nbr_candidat_ecrit)),
            'indemnite_chef_centre': SessionCentre.get_indemnite_sec(self.form_centre, self.session),
            'vac_surveillances': self.getVacSurveillance(),
            'vac_surveillances_hand': self.getVacSurveilHand(),
            'vac_jury_oral': self.getVacJuryOral(),
            'vac_sec_ind': self.getVacChefSecInd(),
            'charge_mission': self.getChargeMision(),
            'vac_correct_ind': self.getVacCorrect(),
            'indemnite_deliberation': self.getIndemDelib(),
            'vac_jury_harmonisation': self.getMontantHarmo()
        }

    def Synthesejson(self, region_id):
        return {
            'id': self.id,
            'region': self.structure.arrondissement.departement.region.region_name,
            'departement': self.structure.arrondissement.departement.departement_name,
            'centre': self.centre.structure.sturcture_name if self.centre_id else self.structure.sturcture_name,
            'scentre': self.structure.sturcture_name,
            'form': self.form_centre,
            'type': self.type_centre,
            'effectif': self.nbr_candidat_ecrit,
            'nbr_candidat_handicap': self.nbr_candidat_handicap,
            'nbr_candidat_delib': self.nbr_candidat_delib,
            'nbr_candidat_oral': self.nbr_candidat_oral,
            'nbr_candidat_epreuve_facultive': self.nbr_candidat_epreuve_facultive,
            'nbr_candidat_inapte': self.nbr_candidat_inapte,
            'frais_organisation': SessionCentre.get_frais_org(int(self.nbr_candidat_ecrit)),
            'indemnite_chef_centre': SessionCentre.get_indemnite_sec(self.form_centre, self.session),
            'vac_surveillances': self.getVacSurveillance(),
            'vac_surveillances_hand': self.getVacSurveilHand(),
            'vac_jury_oral': self.getVacJuryOral(),
            'vac_sec_ind': self.getVacChefSecInd(),
            'charge_mission': self.getChargeMision(),
            'vac_correct_ind': self.getVacCorrect(),
            'indemnite_deliberation': self.getIndemDelib(),
            'dispatching': SessionCentre.dispatch_session_region_montant(self.session.id, region_id),
            'vac_jury_harmonisation': self.getMontantHarmo()
        }

    def getIndemDelib(self):
        if 'D' not in self.type_centre:
            return 0

        nbr_jury = self.nbr_candidat_delib // self.session.nbr_candidat_jury_delib
        total_vac_jury = (self.session.nbr_membre_lecteur_delib * self.session.nbr_vaccation_lecteur_delib) + \
            (self.session.nbr_vaccation_teneur_delib *
             self.session.nbr_membre_teneur_delib)
        montant_indemnite = nbr_jury * \
            (self.session.indemnite_president_jury_delib +
             self.session.indemnite_vpresident_jury_delib)
        montant_vacc = total_vac_jury * self.session.taux_vaccation_membre_delib * nbr_jury
        return montant_vacc + montant_indemnite

    def getVacCorrect(self):
        if "C" not in self.type_centre:
            return 0

        nbr_chef_salle = self.session.nbr_matiere_correct if "C" in self.type_centre else 0
        nbr_copies = self.nbr_candidat_marked * self.session.nbr_matiere_correct
        montant = (self.nbr_candidat_epreuve_facultive +
                   self.nbr_candidat_inapte + nbr_copies) * self.session.taux_copie_correct
        total = montant + (nbr_chef_salle *
                           self.session.indemnite_chef_salle_correct)
        return total

    def getVacSurveillance(self):
        nbsalle = ceil(self.nbr_candidat_ecrit /
                       self.session.nbr_candidat_salle_write)
        nbsurveil = nbsalle * self.session.nbr_surveillant_salle_write
        nbsurvsal = nbsalle // self.session.nbr_salle_surveillants_write
        nbvacc = self.session.nbr_vaccation_jour_write * \
            self.session.nbr_jour_examen_write
        return (nbsurveil+nbsurvsal) * nbvacc * self.session.taux_vaccation_surveillant_write

    def getVacSurveilHand(self):
        if not self.isForDisabled:
            return 0
        nb_salle_hand = ceil(self.nbr_candidat_handicap /
                             self.session.nbr_candidat_salle_hand_write)
        nb_membre = nb_salle_hand * self.session.nbr_surveillant_salle_hand_write
        total = nb_membre * (self.session.nbr_vaccation_transcript_hand_write +
                             self.session.nbr_vaccation_deroulement_hand_write) * self.session.taux_vaccation_surveillant_hand_write
        return total + self.session.indemnite_chef_atelier_hand_write

    def getVacJuryOral(self):
        if not self.isForOral:
            return 0

        if self.nbr_candidat_oral is None:
            return 0
        nb_sous_atelier = ceil(self.nbr_candidat_oral /
                               self.session.nbr_candidat_atelier_oral)
        nombre_total_membre = nb_sous_atelier * self.session.nbr_membre_atelier_oral
        total_vac = nombre_total_membre * self.session.nbr_vaccation_membre_oral
        montant = self.session.taux_vaccation_surveillant_oral * total_vac
        return montant + self.session.indemnite_chef_salle_oral

    def getVacChefSecInd(self):
        nbr_membre_sec = SessionCentre.get_nbr_membre_sec(
            self.nbr_candidat_ecrit, self.session)
        nbr_vaccation_aecrit_sec = SessionCentre.get_vacc_membre_sec_ae(
            self.nbr_candidat_ecrit)
        nbr_vaccation_ecrit_sec = self.session.nbr_vaccation_jour_sec_write * \
            self.session.nbr_jour_examen_write
        nbr_vaccation_apecrit_sec = SessionCentre.get_vacc_membre_sec_ae(
            self.nbr_candidat_ecrit)
        nbr_vaccation_correct_sec = self.session.nbr_vaccation_sec_correct if "C" in self.type_centre else 0
        nbr_vaccation_delib_sec = self.session.nbr_vaccation_sec_delib if "D" in self.type_centre else 0
        indemnite_chef_sec = self.session.indemnite_chef_sec_all if "D" in self.type_centre else self.session.indemnite_chef_sec
        montant = nbr_membre_sec * (nbr_vaccation_aecrit_sec + nbr_vaccation_ecrit_sec + nbr_vaccation_apecrit_sec +
                                    nbr_vaccation_correct_sec + nbr_vaccation_delib_sec) * self.session.taux_vaccation_sec
        total = indemnite_chef_sec + montant
        return total

    def getChargeMision(self):
        nbr_vaccation_aecrit_sec = SessionCentre.get_vacc_membre_sec_ae(
            self.nbr_candidat_ecrit)
        nbr_vaccation_ecrit_sec = self.session.nbr_vaccation_jour_sec_write * \
            self.session.nbr_jour_examen_write
        nbr_vaccation_apecrit_sec = SessionCentre.get_vacc_membre_sec_ae(
            self.nbr_candidat_ecrit)
        nbr_vaccation_correct_sec = self.session.nbr_vaccation_sec_correct if "C" in self.type_centre else 0
        nbr_vaccation_delib_sec = self.session.nbr_vaccation_sec_delib if "D" in self.type_centre else 0
        nbr_vac_cm = nbr_vaccation_aecrit_sec + nbr_vaccation_ecrit_sec + \
            nbr_vaccation_apecrit_sec + nbr_vaccation_correct_sec * 2 + nbr_vaccation_delib_sec

        return (nbr_vac_cm * self.session.taux_vaccation_cm) + self.session.indemnite_cm

    @validates('nbr_candidat_oral')
    def update_nbr_candidat_oral(self, key, value):
        if self.session and value:
            self.nbr_sous_atelier_oral = ceil(
                int(value) / int(self.session.nbr_candidat_atelier_oral)) if value else 0
            self.indemnite_chef_sous_atelier_oral = self.session.indemnite_chef_salle_oral
        return value

    @validates('nbr_candidat_ecrit')
    def update_nbr_candidat_ecrit(self, key, value):
        if self.session and value:
            self.frais_organisation = SessionCentre.get_frais_org(int(value))
            self.vaccation_surveillance = SessionCentre.get_vaccation_surv(
                int(value), self.session)
            self.nbr_membre_sec = SessionCentre.get_nbr_membre_sec(
                int(value), self.session)
            self.nbr_vaccation_aecrit_sec = SessionCentre.get_vacc_membre_sec_ae(
                int(value))
            self.nbr_vaccation_ecrit_sec = self.session.nbr_vaccation_jour_sec_write * \
                self.session.nbr_jour_examen_write
            self.nbr_vaccation_apecrit_sec = SessionCentre.get_vacc_membre_sec_ae(
                int(value))
            self.nbr_vaccation_correct_sec = self.session.nbr_vaccation_sec_correct if "C" in self.type_centre else 0
            self.nbr_vaccation_delib_sec = self.session.nbr_vaccation_sec_delib if "D" in self.type_centre else 0
            self.indemnite_chef_sec = self.session.indemnite_chef_sec_all if "D" in self.type_centre else self.session.indemnite_chef_sec
            self.nbr_vaccation_cm = (self.nbr_vaccation_correct_sec * 2) + self.nbr_vaccation_delib_sec + \
                self.nbr_vaccation_aecrit_sec + \
                self.nbr_vaccation_apecrit_sec + self.nbr_vaccation_ecrit_sec
            self.indemnite_cm = self.session.indemnite_cm
        return value

    @validates('form_centre')
    def update_form_centre(self, key, value):
        if self.session:
            self.indemnite_chefcentre = SessionCentre.get_indemnite_sec(
                value, self.session)
        return value

    @staticmethod
    def get_frais_org(value) -> float:
        if value < 17:
            return 5000
        if value < 834:
            return value * 300
        return 250000

    @staticmethod
    def get_nbr_membre_sec(value, session) -> int:
        nbmbr = ceil(value/250)
        if nbmbr < 2:
            return 3
        return nbmbr+2

    @staticmethod
    def get_vacc_membre_sec_ae(value) -> int:
        if value <= 750:
            return 2
        if value <= 1500:
            return 4
        return 6

    @staticmethod
    def get_indemnite_sec(value, session) -> float:
        if value == 'C':
            return session.indemnite_chef_centre_write
        if value == 'CA':
            return float(session.indemnite_chef_centre_write) + 50000
        if value == 'SA':
            return float(session.indemnite_chef_scentre_write) + 50000
        return session.indemnite_chef_scentre_write

    @staticmethod
    def get_vaccation_surv(value, session) -> float:
        nbsalle = ceil(value/session.nbr_candidat_salle_write)
        nbsurveil = nbsalle * session.nbr_surveillant_salle_write
        nbsurvsal = nbsalle // session.nbr_salle_surveillants_write
        nbvacc = session.nbr_vaccation_jour_write * session.nbr_jour_examen_write
        return (nbsurveil+nbsurvsal) * nbvacc * session.taux_vaccation_surveillant_write

    def insert(self):
        db.session.add(self)
        db.session.commit()

    def delete(self):
        db.session.delete(self)
        db.session.commit()

    def update(self, data):
        self.form_centre = data['form']
        self.type_centre = data['type']
        self.centre_id = data['centre']
        self.isForDisabled = data['for_disabled']
        self.isForOral = data['for_oral']
        self.isForHarmo = data['for_harmo']
        self.nbr_candidat_ecrit = data['nbr_candidat_ecrit']
        self.nbr_candidat_handicap = data['nbr_candidat_handicap']
        self.nbr_copies_marked = data['nbr_copies_marked']
        self.nbr_matiere = data['nbr_matiere']
        self.nbr_candidat_marked = data['nbr_candidat_marked']
        self.nbr_candidat_delib = data['nbr_candidat_delib']
        self.nbr_candidat_oral = data['nbr_candidat_oral']
        self.nbr_candidat_epreuve_facultive = data['nbr_candidat_epreuve_facultive']
        self.nbr_candidat_inapte = data['nbr_candidat_inapte']
        db.session.commit()

    @classmethod
    def getByID(cls, _id):
        find = cls.query.filter_by(id=_id).one_or_none()
        return find

    @classmethod
    def getByDivide(cls, _id, nb_candidate):
        find = cls.query.filter_by(id=_id).one_or_none()
        find.nbr_candidat_ecrit -= nb_candidate
        return db.session.commit()

    @classmethod
    def centre_session_departement(cls, session_id, department_id):
        centres = db.session.query(cls).from_statement(
            text("""SELECT c.* FROM sessioncentres c  WHERE c.session_id = :p1 AND c.structure_id in (SELECT id FROM structures WHERE arrondissement_id in (SELECT id FROM arrondissements WHERE departement_id = :p2))""")
        ).params(p1=session_id, p2=department_id).all()
        return centres

    @classmethod
    def centre_session_region_harmo(cls, session_id, region_id):
        centre = db.session.query(cls).from_statement(
            text("""SELECT c.* FROM sessioncentres c WHERE c."isForHarmo" = true AND c.session_id = :p1 AND c.structure_id in (SELECT id FROM structures WHERE arrondissement_id in (SELECT id FROM arrondissements WHERE departement_id in (SELECT id FROM departements WHERE region_id = :p2)))""")
        ).params(p1=session_id, p2=region_id).first()
        return centre

    @classmethod
    def centre_session_region_oral(cls, session_id, region_id):
        centre = db.session.query(cls).from_statement(
            text("""SELECT c.* FROM sessioncentres c WHERE c."isForOral" = true AND c.session_id = :p1 AND c.structure_id in (SELECT id FROM structures WHERE arrondissement_id in (SELECT id FROM arrondissements WHERE departement_id in (SELECT id FROM departements WHERE region_id = :p2)))""")
        ).params(p1=session_id, p2=region_id).all()
        return centre

    @classmethod
    def centre_session_region_disabled(cls, session_id, region_id):
        centre = db.session.query(cls).from_statement(
            text("""SELECT c.* FROM sessioncentres c WHERE c."isForDisabled" = true AND c.session_id = :p1 AND c.structure_id in (SELECT id FROM structures WHERE arrondissement_id in (SELECT id FROM arrondissements WHERE departement_id in (SELECT id FROM departements WHERE region_id = :p2)))""")
        ).params(p1=session_id, p2=region_id).all()
        return centre

    @staticmethod
    def centre_session_region_eff(session_id, region_id):
        if region_id:
            statement = text("""SELECT SUM(c.nbr_candidat_ecrit) AS eff_total FROM sessioncentres c  WHERE c.session_id = :p1 AND c.structure_id in (SELECT id FROM structures WHERE arrondissement_id in (SELECT id FROM arrondissements WHERE departement_id in (SELECT id FROM departements WHERE region_id = :p2)))""")
        else:
            statement = text(
                """SELECT SUM(c.nbr_candidat_ecrit) AS eff_total FROM sessioncentres c  WHERE c.session_id = :p1 """)
        result = db.engine.execute(
            statement, {'p1': session_id, 'p2': region_id})
        effs = result.first()
        return effs[0]

    @staticmethod
    def centre_session_nbmat(session_id):
        statement = text(
            """SELECT SUM(c.nbr_matiere) AS eff_total FROM sessioncentres c  WHERE c."isForHarmo" = true AND c.session_id = :p1""")
        result = db.engine.execute(
            statement, {'p1': session_id})
        effs = result.first()
        return effs[0]

    @classmethod
    def centre_session_region(cls, session_id, region_id):
        centres = db.session.query(cls).from_statement(
            text("""SELECT c.* FROM sessioncentres c  WHERE c.session_id = :p1 AND c.structure_id in (SELECT id FROM structures WHERE arrondissement_id in (SELECT id FROM arrondissements WHERE departement_id in (SELECT id FROM departements WHERE region_id = :p2)))""")
        ).params(p1=session_id, p2=region_id).all()
        return centres

    @classmethod
    def dispatch_session_region(cls, session_id, region_id):
        session = Session.query.filter(Session.id == session_id).one_or_none()
        if session is None:
            return {}

        region = Region.query.filter(Region.id == region_id).one_or_none()

        effs = SessionCentre.centre_session_region_eff(session_id, region_id)
        nb_member = 6 if effs <= 5000 else ceil(effs / 5000) + 3
        indemnite = session.indemnite_chef_sec_dispacth
        if region is None:
            nb_member = 0
            indemnite = 0
            for i in range(1, 10):
                eff = SessionCentre.centre_session_region_eff(session_id, i)
                if eff:
                    indemnite += session.indemnite_chef_sec_dispacth
                    nb_member += 6 if eff <= 5000 else ceil(eff / 5000) + 3

        nbr_vac_membre = session.nbr_vaccation_prepa_dispatch + session.nbr_vaccation_awrite_dispatch + \
            session.nbr_vaccation_acorrect_dispatch + session.nbr_vaccation_adelib_dispatch
        montant_vac = nb_member * nbr_vac_membre * \
            session.taux_vaccation_membre_dispatch
        return {
            'region': region.region_name if region is not None else "Nationale",
            'effectif': effs,
            'nb_member': nb_member,
            'nbr_vac_prepa': session.nbr_vaccation_prepa_dispatch,
            'nbr_vac_ae': session.nbr_vaccation_awrite_dispatch,
            'nbr_vac_ac': session.nbr_vaccation_acorrect_dispatch,
            'nbr_vac_ad': session.nbr_vaccation_adelib_dispatch,
            'nbr_vac_membre': nbr_vac_membre,
            'taux_vac': session.taux_vaccation_membre_dispatch,
            'montant_vac': montant_vac,
            'indemnite': indemnite,
            'frais': montant_vac + indemnite
        }

    @classmethod
    def harmo_session_region(cls, session_id, region_id):
        session = Session.query.filter(Session.id == session_id).one_or_none()
        if session is None:
            return {}

        region = Region.query.filter(Region.id == region_id).one_or_none()

        total_vac_jury = session.nbr_membre_jury_harmo * \
            session.nbr_vaccation_membre_harmo + session.nbr_vaccation_responsable_harmo

        if region is None:
            nbr_matiere = SessionCentre.centre_session_nbmat(session_id)
            return {
                'region': "National",
                'effectif': SessionCentre.centre_session_region_eff(session_id, region_id),
                'nbr_matiere': ceil(nbr_matiere/10),
                'nbr_vac_resp': session.nbr_vaccation_responsable_harmo,
                'nbr_vac_mem': session.nbr_vaccation_membre_harmo,
                'nbr_memb_jur': session.nbr_membre_jury_harmo,
                'total_vac_jury': total_vac_jury,
                'taux_vac': session.taux_vaccation_harmo,
                'frais': total_vac_jury * session.taux_vaccation_harmo * nbr_matiere
            }

        centre = SessionCentre.centre_session_region_harmo(
            session_id, region_id)

        return {
            'region': region.region_name,
            'effectif': SessionCentre.centre_session_region_eff(session_id, region_id),
            'nbr_matiere': centre.nbr_matiere,
            'nbr_vac_resp': session.nbr_vaccation_responsable_harmo,
            'nbr_vac_mem': session.nbr_vaccation_membre_harmo,
            'nbr_memb_jur': session.nbr_membre_jury_harmo,
            'total_vac_jury': total_vac_jury,
            'taux_vac': session.taux_vaccation_harmo,
            'frais': total_vac_jury * session.taux_vaccation_harmo * centre.nbr_matiere
        }

    @classmethod
    def centrecorrect_session_region(cls, session_id, region_id):
        centres = db.session.query(cls).from_statement(
            text("""SELECT c.* FROM sessioncentres c  WHERE c.session_id = :p1 AND c.type_centre IN ('EC', 'ECD', 'EPC', 'EPCD') AND c.structure_id in (SELECT id FROM structures WHERE arrondissement_id in (SELECT id FROM arrondissements WHERE departement_id in (SELECT id FROM departements WHERE region_id = :p2)))""")
        ).params(p1=session_id, p2=region_id).all()
        return centres

    @classmethod
    def centredelib_session_region(cls, session_id, region_id):
        centres = db.session.query(cls).from_statement(
            text("""SELECT c.* FROM sessioncentres c  WHERE c.session_id = :p1 AND c.type_centre IN ('ECD', 'EPCD') AND c.structure_id in (SELECT id FROM structures WHERE arrondissement_id in (SELECT id FROM arrondissements WHERE departement_id in (SELECT id FROM departements WHERE region_id = :p2)))""")
        ).params(p1=session_id, p2=region_id).all()
        return centres

    @classmethod
    def dispatch_session_region_montant(cls, session_id, region_id):
        session = Session.query.filter(Session.id == session_id).one_or_none()
        if session is None:
            return {}

        region = Region.query.filter(Region.id == region_id).one_or_none()

        effs = SessionCentre.centre_session_region_eff(session_id, region_id)
        nb_member = 6 if effs <= 5000 else ceil(effs / 5000) + 3
        indemnite = session.indemnite_chef_sec_dispacth
        if region is None:
            nb_member = 0
            indemnite = 0
            for i in range(1, 10):
                eff = SessionCentre.centre_session_region_eff(session_id, i)
                if eff:
                    indemnite += session.indemnite_chef_sec_dispacth
                    nb_member += 6 if eff <= 5000 else ceil(eff / 5000) + 3

        nbr_vac_membre = session.nbr_vaccation_prepa_dispatch + session.nbr_vaccation_awrite_dispatch + \
            session.nbr_vaccation_acorrect_dispatch + session.nbr_vaccation_adelib_dispatch
        montant_vac = nb_member * nbr_vac_membre * \
            session.taux_vaccation_membre_dispatch

        return montant_vac + indemnite

    def getMontantHarmo(self):
        if not self.isForHarmo:
            return 0
        total_vac_jury = self.session.nbr_membre_jury_harmo * \
            self.session.nbr_vaccation_membre_harmo + \
            self.session.nbr_vaccation_responsable_harmo

        return total_vac_jury * self.session.taux_vaccation_harmo * self.nbr_matiere

    def __repr__(self):
        return f'<Centre ID: {self.id} Name: {self.form_centre                                                                                        } >'

from ast import Num
from datetime import datetime, timedelta
from email.policy import default
from time import timezone
from operator import or_
from sqlalchemy import Column, String, Integer, Boolean, Numeric, Float, func
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
        'nbr_salle_surveillants_write > 0'), nullable=True, server_default="5")
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
            "taux_matiere_oeuvre_esf_candidat" : self.taux_matiere_oeuvre_esf_candidat,
            "taux_matiere_oeuvre_stt_candidat" : self.taux_matiere_oeuvre_stt_candidat,
            "taux_vaccation_examinateur_pratique": self.taux_vaccation_examinateur_pratique,
            "nbr_examinateur_atelier_pratique": self.nbr_examinateur_atelier_pratique
        }

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
        return f'<Session ID: {self.id} Name: {self.session_name} Exam: {self.exam_id}  >'


class SessionCentre(db.Model):
    __tablename__ = 'sessioncentres'
    session_id = Column(Integer, db.ForeignKey(
        'sessions.id', ondelete="CASCADE"), primary_key=True)
    structure_id = Column(Integer, db.ForeignKey(
        'structures.id', ondelete="CASCADE"), primary_key=True)
    form_centre = Column(db.Enum('C', 'CA', 'SC', 'SA', name='formsCentre'),
                         nullable=False, server_default='SC')
    type_centre = Column(db.Enum('E', 'EC', 'ECD', 'EP', 'EPC', 'EPCD', name='typesCentre'),
                         nullable=False, server_default='E')
    isForDisabled = Column(Boolean, nullable=False, server_default='False')
    isForOral = Column(Boolean, nullable=False, server_default='False')
    nbr_candidat_ecrit = Column(Integer, db.CheckConstraint(
        'nbr_candidat_ecrit > 0'), nullable=False, server_default='10')
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

    def json(self):
        return {
            'id': self.id,
            'session': self.session.json(),
            'structure': self.structure.json(),
            'form': self.form_centre,
            'type': self.type_centre,
            'for_disabled': self.isForDisabled,
            'for_oral': self.isForOral,
            'nbr_candidat_ecrit': self.nbr_candidat_ecrit,
            'nbr_candidat_handicap': self.nbr_candidat_handicap,
            'nbr_copies_marked': self.nbr_copies_marked,
            'nbr_candidat_marked': self.nbr_candidat_marked,
            'nbr_candidat_delib': self.nbr_candidat_delib,
            'nbr_candidat_oral': self.nbr_candidat_oral,
            'nbr_candidat_epreuve_facultive': self.nbr_candidat_epreuve_facultive,
            'nbr_candidat_inapte': self.nbr_candidat_inapte
        }

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

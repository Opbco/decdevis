"""Validator Module"""
import re
from dateutil import parser
import datetime


def validate(data, regex):
    """Custom Validator"""
    return True if re.match(regex, data) else False


def validate_password(password: str):
    """Password Validator"""
    reg = r"\b^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!#%*?&]{8,20}$\b"
    return validate(password, reg)


def validate_dateformat(date_str: str):
    """Date format Validator"""
    res = True
    try:
        res = bool(parser.parse(date_str))
    except ValueError:
        res = False
    return res


def get_current_session():
    date = datetime.date.today()
    if date.month > 6:
        return f'{date.year}/{date.year + 1}'
    return f'{date.year - 1}/{date.year}'


def validate_email(email: str):
    """Email Validator"""
    regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    return validate(email, regex)


def validate_user(**args):
    """User Validator"""
    if not args.get('email') or not args.get('password') or not args.get('user_name'):
        return {
            'email': 'Email is required',
            'password': 'Password is required',
            'username': 'Username is required'
        }
    if not isinstance(args.get('user_name'), str) or \
            not isinstance(args.get('email'), str) or not isinstance(args.get('password'), str):
        return {
            'email': 'Email must be a string',
            'password': 'Password must be a string',
            'username': 'Username must be a string'
        }
    if not validate_email(args.get('email')):
        return {
            'email': 'Email is invalid'
        }
    if not validate_password(args.get('password')):
        return {
            'password': 'Password is invalid, Should be atleast 8 characters with \
                upper and lower case letters, numbers and special characters'
        }
    if not 4 <= len(args.get('user_name')) <= 30:
        return {
            'username': 'Username must be between 2 and 30 words'
        }
    return True


def validate_username_and_password(username, password):
    """Email and Password Validator"""
    if not (username and password):
        return {
            'username': 'Email / Username is required',
            'password': 'Password is required'
        }
    if not 4 <= len(username):
        return {
            'username': 'Username or email valid'
        }
    if not validate_password(password):
        return {
            'password': 'Password is invalid, Should be atleast 8 characters with \
                upper and lower case letters, numbers and special characters'
        }
    return True


def validate_structure(**args):
    """Structure Validator"""
    if not args.get('name') or not args.get('adresse') or not args.get('contacts') or not args.get('form') or not args.get('language') or not args.get('ordre') or not args.get('arrondissement'):
        return {
            'name': 'Name is required',
            'adresse': 'Adresse is required',
            'contacts': 'Contacts is required',
            'form': 'Form is required',
            'language': 'Language is required',
            'ordre': 'Ordre is required',
            'arrondissement': 'Arrondissement is required'
        }
    if not isinstance(args.get('name'), str) or \
            not isinstance(args.get('adresse'), str) or not isinstance(args.get('contacts'), str):
        return {
            'name': 'Name must be a string',
            'adresse': 'Adresse must be a string',
            'contacts': 'Contacts must be a string'
        }
    if not 4 <= len(args.get('name')):
        return {
            'name': 'Name must be between 2 and 30 words'
        }
    return True

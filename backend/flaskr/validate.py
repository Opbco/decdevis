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


def validate_centre(**args):
    """Centre Validator"""
    print(args)
    if not args.get('session') or not args.get('structure') or not args.get('form') or not args.get('type') or args.get('for_disabled', None) is None or args.get('for_oral', None) is None:
        return {
            'session': 'session of examination is required',
            'structure': 'the structure hosting the examination is required',
            'form': 'the form of the center is required',
            'type': 'the Type of the center is required',
            'for_disabled': 'you have to indicate if the center will be used for disabled candidate',
            'for_oral': 'you have to indicate if the center will be used for ORAL'
        }
    if not isinstance(args.get('session'), int) or not isinstance(args.get('structure'), int) or not isinstance(args.get('for_disabled'), bool) or not isinstance(args.get('for_oral'), bool):
        return {
            'session': 'session must be an integer',
            'structure': 'structure must be an integer',
            'for_disabled': 'for_disabled must be a boolean',
            'for_oral': 'for_oral must be a boolean'
        }
    return True

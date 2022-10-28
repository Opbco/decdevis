"""Validator Module"""
import re
from dateutil import parser


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
    if not 2 <= len(args.get('user_name')) <= 30:
        return {
            'username': 'Username must be between 2 and 30 words'
        }
    return True

def validate_email_and_password(email, password):
    """Email and Password Validator"""
    if not (email and password):
        return {
            'email': 'Email is required',
            'password': 'Password is required'
        }
    if not validate_email(email):
        return {
            'email': 'Email is invalid'
        }
    if not validate_password(password):
        return {
            'password': 'Password is invalid, Should be atleast 8 characters with \
                upper and lower case letters, numbers and special characters'
        }
    return True
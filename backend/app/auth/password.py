import bcrypt

# Mock bcrypt.__about__ for passlib compatibility in newer python/bcrypt versions
if not hasattr(bcrypt, "__about__"):
    class About:
        pass
    about = About()
    about.__version__ = bcrypt.__version__
    bcrypt.__about__ = about

# Patch bcrypt.hashpw to avoid ValueError: password cannot be longer than 72 bytes
# which passlib triggers during internal wrap bug checks using an 81-byte password
original_hashpw = bcrypt.hashpw
def patched_hashpw(password, salt):
    passwd_bytes = password if isinstance(password, bytes) else password.encode("utf-8")
    if len(passwd_bytes) > 72:
        passwd_bytes = passwd_bytes[:72]
    return original_hashpw(passwd_bytes, salt)
bcrypt.hashpw = patched_hashpw

from passlib.context import CryptContext

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str):
    return pwd_context.hash(password)


def verify_password(password: str, hashed_password: str):
    return pwd_context.verify(password, hashed_password)
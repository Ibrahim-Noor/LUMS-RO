import subprocess
import sys
import os

def ensure_deps():
    try:
        import flask
        return True
    except ImportError:
        print("Flask not found, installing dependencies...", flush=True)
        subprocess.check_call([
            sys.executable, "-m", "pip", "install",
            "flask", "flask-cors", "flask-jwt-extended",
            "flask-sqlalchemy", "flask-bcrypt",
            "psycopg2-binary", "gunicorn", "marshmallow"
        ], stdout=sys.stdout, stderr=sys.stderr)
        return True

try:
    print(f"Python executable: {sys.executable}", flush=True)
    print(f"Python version: {sys.version}", flush=True)
    print(f"Working directory: {os.getcwd()}", flush=True)

    ensure_deps()

    from flask_app import create_app
    app = create_app()

    if __name__ == '__main__':
        port = int(os.environ.get('FLASK_PORT', '5001'))
        print(f"Starting Flask on port {port}...", flush=True)
        app.run(host='0.0.0.0', port=port, debug=False)
except Exception as e:
    print(f"FATAL ERROR starting Flask: {e}", flush=True)
    import traceback
    traceback.print_exc()
    sys.exit(1)

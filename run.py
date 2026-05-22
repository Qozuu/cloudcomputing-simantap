import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # Menggunakan host 0.0.0.0 agar nanti bisa diakses oleh komputer lain/cloud
    app.run(host='0.0.0.0', port=port)
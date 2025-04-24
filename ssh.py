import paramiko

# Datos de conexión
hostname = "ruizgijon.ddns.net"
username = "sancheza"
password = "s$Ancheza_#8"

# Conexión SSH
ssh = paramiko.SSHClient()
ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

try:
    ssh.connect(hostname, username=username, password=password)

    # Ejecutar comando mysql con contraseña
    mysql_command = 'mysql -u sancheza -p s$Ancheza_#8'
    stdin, stdout, stderr = ssh.exec_command(mysql_command)

    # Leer la salida
    print(stdout.read().decode())
    print(stderr.read().decode())

except Exception as e:
    print(f"Error: {e}")

finally:
    ssh.close()

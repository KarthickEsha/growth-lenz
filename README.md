# README

## Local Host Testing Setup Instruction

### Step:1 : Make changes in hosts file

- Windows Run Command
  %SystemRoot%\System32\drivers\etc\hosts

eg. C:\Windows\System32\drivers\etc\hosts

- Linux / MacOS
  sudo nano /etc/hosts

#### Add the following lines to host file

127.0.0.1 pms.pms.com
127.0.0.1 karthick.kriyatec.com

#### For Windows Add This Also

::1 pms.pms.com

- each Organization has its own sub-domain configuration
- pms.pms.com is for development & test application

### Step:2 : Test the Application

- npm start
- Now open a browser and type the configured domain name
  eg. lea.pms.com:4200

pms.pms.com:4200

# Build and Deploy#

npm run build

# Path

/home/pms.kriyatec.com/public_html

### Build Shell Script

- you need to install expect library
- 1. sudo apt install expect
- 2. nano file-transfer.sh
- Copy the following script and save the fil

#!/usr/bin/expect

spawn sftp root@68.183.244.220
expect "password:"
send "KT@2021IT\r"
expect "sftp>"
send "cd /home/pms.kriyatec.com/public_html"
expect "sftp>"
send "put -r <your build folder>/home/pms.kriyatec.com/public_html\* \n"
expect "sftp>"
send "exit\n"
interact

- 4. chmod +x file-transfer.sh

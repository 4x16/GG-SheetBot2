[Unit]
Description=GG-Sheetbot
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/GG-SheetBot2
ExecStart=/usr/bin/node .
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=discord-bot
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target

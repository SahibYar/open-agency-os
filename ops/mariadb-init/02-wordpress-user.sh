#!/bin/bash
# Creates a dedicated WordPress DB user so WordPress and Mautic do not share credentials.
# This script runs after 01-wordpress.sql on a fresh volume.
set -e

mariadb -u root -p"${MYSQL_ROOT_PASSWORD}" -e "
  CREATE USER IF NOT EXISTS 'wordpress'@'%' IDENTIFIED BY '${WORDPRESS_DB_PASSWORD}';
  GRANT ALL PRIVILEGES ON wordpress.* TO 'wordpress'@'%';
  FLUSH PRIVILEGES;
"

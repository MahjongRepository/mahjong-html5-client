#!/bin/sh -e

# we need to do it, to have latest version of packages
sudo apt-get update
sudo apt-get -y upgrade

curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
sudo apt-get install -y nodejs

cd /vagrant/
npm install
sudo npm install gulp -g
sudo npm install typings -g

require "capistrano/node-deploy"
# https://github.com/loopj/capistrano-node-deploy/blob/master/lib/capistrano/node-deploy.rb

set :application, "StitchYourStoryRenderer"
set :repository,  "git@github.com:bpartridge/stitch-your-story-render.git"
set :scm, :git
default_run_options[:pty] = true

set :user, "ubuntu"
set :node_user, "ubuntu"
set :deploy_to, "/home/ubuntu/apps/stitchyourstory-render"
set :deploy_via, :remote_cache

role :app, "ec2-23-21-22-109.compute-1.amazonaws.com"

# Need to sudo apt-get update, install git, install libsdl-dev

namespace :ubuntu do
  desc "Install all packages"
  task :install do
    sudo "add-apt-repository ppa:richarvey/nodejs -y"
    sudo "apt-get update -y"
    sudo "apt-get install build-essential git blender libsdl-dev libxi-dev nodejs npm -y"
  end
end

task :download_blender do
  run "cd #{release_path} && npm run download-blender"
end

before "deploy", "ubuntu:install"
# after "deploy", "download_blender"

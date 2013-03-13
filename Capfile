before "deploy", "git:push"
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
    sudo "apt-get install build-essential git blender libsdl-dev libxi-dev npm -y"
  end
end

task :download_blender do
  run "cd #{release_path} && npm run download-blender"
end

namespace :nginx do
  desc "Create cache directory"
  task :create_cache_dir do
    sudo "mkdir -p /var/www"
    sudo "chown www-data /var/www"
  end

  desc "Copy nginx configuration"
  task :configure do
    sudo "cp #{release_path}/nginx.conf /etc/nginx/nginx.conf"
  end

  desc "Restart nginx"
  task :restart do
    sudo "/etc/init.d/nginx reload"
  end
end

before "deploy", "ubuntu:install"
# after "deploy", "download_blender"
after "deploy", "nginx:create_cache_dir", "nginx:configure", "nginx:restart"

##### Ensure git push #####

namespace :git do
  desc "Push local changes to Git repository"
  task :push do
 
    # Check for any local changes that haven't been committed
    # Use 'cap deploy:push IGNORE_DEPLOY_RB=1' to ignore changes to this file (for testing)
    status = %x(git status --porcelain).chomp
    if status != ""
      if status !~ %r{^[M ][M ] config/deploy.rb$}
        raise Capistrano::Error, "Local git repository has uncommitted changes"
      elsif !ENV["IGNORE_DEPLOY_RB"]
        # This is used for testing changes to this script without committing them first
        raise Capistrano::Error, "Local git repository has uncommitted changes (set IGNORE_DEPLOY_RB=1 to ignore changes to deploy.rb)"
      end
    end
 
    # Check we are on the master branch, so we can't forget to merge before deploying
    branch = %x(git branch --no-color 2>/dev/null | sed -e '/^[^*]/d' -e 's/* \\(.*\\)/\\1/').chomp
    if branch != "master" && !ENV["IGNORE_BRANCH"]
      raise Capistrano::Error, "Not on master branch (set IGNORE_BRANCH=1 to ignore)"
    end
 
    # Push the changes
    if ! system "git push #{fetch(:repository)} master"
      raise Capistrano::Error, "Failed to push changes to #{fetch(:repository)}"
    end
 
  end
end

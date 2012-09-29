class BilibiliUser < ActiveRecord::Base
  attr_accessible :accesskey, :face, :mid, :rank, :uname
end

class CreateBilibiliUsers < ActiveRecord::Migration
  def change
    create_table :bilibili_users do |t|
      t.decimal :mid
      t.string :uname
      t.string :face
      t.decimal :rank
      t.string :accesskey

      t.timestamps
    end
    
    add_index :bilibili_users, :mid
  end
end

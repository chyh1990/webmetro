class ChangeDataTypeForBilibiliUserMid < ActiveRecord::Migration
  def up
    change_table :bilibili_users do |t|
      t.change :mid, :integer
      t.change :rank, :integer
    end
  end

  def down
    change_table :bilibili_users do |t|
      t.change :mid, :decimal
      t.change :rank, :decimal
    end
  end
end

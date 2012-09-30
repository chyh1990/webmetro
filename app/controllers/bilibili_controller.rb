class BilibiliController < ApplicationController
  BILIBILI_APPKEY = 'c7d7181baa51c7e7'
  BILIBILI_PUBLICKEY = 'efbc894df29d3be9c08940be6f480a3d'
  APIURL = 'http://api.bilibili.tv/'
  
  def check_hash()
    return true
  end
  
  def channels
    render :text => 'error'
  end
  
  def api_list
    if !params[:tid]
      render :text => 'error'
      return
    end
		url = APIURL + 'list?tid=' + params[:tid]
		url += '&appkey=' + BILIBILI_APPKEY
		url += '&page=' + params[:page] if(params[:page]);
		url += '&type=json'
		url += '&pagesize=' + params[:pagesize] if(params[:pagesize] && params[:pagesize].to_i < 50);
  	url += '&order=' + params[:order] if(params[:order]);
    response = open(url).read
    render :json => response
  end
  
  def login_callback
    #render(:text => 'hello ' + (params[:mid] || 'nil'))
    if params[:mid] == nil || params[:uname] == nil
      render :text => 'err'
      return
    end
    if !check_hash()
      render :text => 'hash err'
      return
    end
    user = BilibiliUser.find_by_mid(params[:mid].to_i)
    if !user
      user = BilibiliUser.new(
        :mid => params[:mid].to_i,
        :face => params[:face].to_s,
        :rank => params[:rank].to_i,
        :accesskey => params[:access_key].to_s,
        :uname => params[:uname].to_s)
      if !user.save
        render :text => 'Failed to add user'
        return
      end
    end
    session[:bilibili_uid] = user.id
    redirect_to '/index.html?uid=' + user.id.to_s
  end
  
  def get_user_info
    if !session[:bilibili_uid]
      render :text => '{}'
      return
    end
    @user = BilibiliUser.find( session[:bilibili_uid] )
    respond_to do |format|
      format.json { render :json => @user }
    end
  end
  
  def logout
    session[:bilibili_uid] = nil
    render :text => 'Logout'
  end
end

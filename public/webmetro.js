function getMarginOrPadding(elem, tag){
	return parseInt(elem.css(tag).replace('px'));
}

function getBlocksWidth(){
	var w = 0;
	$('.metroblock').each(function(){
		w += $(this).outerWidth(true);
	});
	if(w > 0){
		w -= getMarginOrPadding($('.metroblock'), 'marginRight');
	}
	return w;
}

function setInnerWidth(){
	var w = getBlocksWidth();
	var l = getMarginOrPadding($('#contentinner'), 'marginLeft');
	var r = getMarginOrPadding($('#contentinner'), 'marginRight');
	//console.log(w+' '+l+' '+r)
	$('#contentinner').width(w+l+r);
}

function setBlocksHeight(){
	var h = $('#content').height();
	$('.metroblock').height(h);
}

//main scroll bar
(function( $ ) {
	$.fn.jMainScroll = function(viewport, content) {
		var obj = {
			_pos: 0,
			_view: viewport,
			_content: content,
			_ratio: 1.0,
			_wheelSpeed: 40,
			
			setDelta : function(delta){
				this.setPosition(this._pos + delta);
			},
			setPosition: function(pos){
				var vs = this._view.width()
				, cs = this._content.width();
				if(this._bar == null)
					return;
				var f = this._ratio;
				if(f >= 1.0){
					return;
				}
				if(pos < 0 || pos > cs - vs){
					return;
				}
				this._pos = pos;
				var p = pos * f;
				this._bar.css('left', p+'px');
				this._content.css('left', -pos+'px');
			},
			reinitialize: function(resetPos){
				var vs = this._view.width()
				, cs = this._content.width();
				this._ratio = vs / cs;
				if(this._ratio >= 1.0){
					return obj;
				}
				var myw = this._track.width();
				var barw = vs / cs * myw;
				bar.css('width', barw + 'px');
				if(resetPos)
					this._pos = 0;
				else{
					if(this._pos >= cs - vs)
					this._pos = cs - vs - 0.01;
				}
				this.setPosition(this._pos);
			}
		};

		this.css('margin', '0').css('padding', '0');
		var bar = $('<div class="main-scroll-bar" style="margin:0;padding:0;"></div>').appendTo(this);
		bar.css('height', '100%').css('position','absolute').css('top', '0');
		bar.hide();
		obj._bar = bar;
		obj._track = this;
		// using the event helper
		content.mousewheel(function(event, delta, deltaX, deltaY) {
			if(obj._bar == null)
				return;
			var v = deltaX;
			if(Math.abs(v)<0.00001)
				v = -deltaY;
			if(obj._hideTimer){
				window.clearTimeout(obj._hideTimer);
			}else{
				//show the bar
				obj._bar.fadeIn('fast');
			}
			obj._hideTimer = window.setTimeout(function(){
				//hide
				obj._bar.fadeOut('fast');
				obj._hideTimer = null;
			}, 200);
		    obj.setDelta(v * obj._wheelSpeed);
			//console.log(delta, deltaX, deltaY);
			event.preventDefault();
		});
		obj.reinitialize(true);
		return obj;
	};
})( jQuery );

//metro block
(function( $ ) {
	var methods = {
     init : function( options ) {
       return this.each(function(){
         var $this = $(this),
             data = $this.data('metroblk')
			;

         // If the plugin hasn't been initialized yet
         if ( ! data ) {
			var obj = new MetroBlock($this);
           $(this).data('metroblk', {
               target : $this,
			   obj    : obj
           });
         }
       });
     },
    	destroy : function( ) {
		},
		setContentObject : function(apps) {
			return this.each(function(){
				var $this = $(this),
				data = $this.data('metroblk');
				if(data){
					data.obj.setContentObject(apps);
				}
			});
		},
		reinitialize: function() {
			return this.each(function(){
				var $this = $(this),
				data = $this.data('metroblk');
				if(data){
					data.obj.reinitialize();
				}
			});			
		},
		
		
		setVisibility: function(show){
			return this.each(function(){
				var $this = $(this),
				data = $this.data('metroblk');
				if(!data)
					return;
				$('.metrosubblock', $this).each(function(){
					var caller = $(this);
					setTimeout(function(){
						if(show)
							caller.fadeOut(200);
						else
							caller.fadeOut(200);
					}, Math.random() * 300)
				});
			});
		} 
	};
	$.fn.jMetroBlock = function(method){
	    if ( methods[method] ) {
	      return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
	    } else if ( typeof method === 'object' || ! method ) {
	      return methods.init.apply( this, arguments );
	    } else {
	      $.error( 'Method ' +  method + ' does not exist on jQuery.jMetroBlock' );
	    }
		return this;
	};
	//the object
    function MetroBlock( root )
    {
        this.oWrapper    = root;
		this.title = 'Unknown';
		this.options = {
			tileSize: 150,
			tileMargin: 10,
		};
		
		function calcRowWidth(apps, rowidxs){
			var s = 0;
			for(var i=0;i<rowidxs.length;i++){
				s += apps[rowidxs[i]].width;
			}
			return s;
		}
		
		function sortRowsByWidth(apps, arr){
			arr.sort(function(x,y){
				return calcRowWidth(apps, y) - calcRowWidth(apps, x);
			});
			return arr;
		}
		
		//fill row first
		function arrangeBlocks0(apps, rowCnt){
			var l = [];
			var rc = 0;
			for(var i=0;i<apps.length;i++){
				if(l[rc] == null) l[rc] = [];
				l[rc].push(i);
				rc = (rc + 1) % rowCnt;
			}
			return sortRowsByWidth(apps, l);
		}
		
		//fill shortest
		function arrangeBlocks1(apps, rowCnt){
			if(rowCnt==0)
				return null;
			var l = [];
			var shortRow = 0;
			var rowW = [];
			for(var i=rowCnt-1;i>=0;i--){
				l[i] = [];
				rowW[i] = 0;
			}
			
			for(var i=0;i<apps.length;i++){
				rowW[shortRow] += apps[i].width;
				l[shortRow].push(i);
				shortRow = rowW.indexOf(Math.min.apply(Math, rowW));
			}
			return sortRowsByWidth(apps, l);
		}
		
		this.arrangeFunc = arrangeBlocks1;
		
 		this.reinitialize = function(){
			this.oWrapper.empty();
			if(this._apps == null)
				return;
			var root = this.oWrapper;
			var options = this.options;
			var apps = this._apps;
			root.css('min-height', options.tileSize + options.tileMargin * 2);
			var totalH = root.innerHeight() ;
			var rowCnt = Math.floor((totalH - options.tileMargin) / (options.tileSize+options.tileMargin));
			
			//console.log('rowCnt: '+ rowCnt + ' ' + totalH);
			var arr = this.arrangeFunc(this._apps, rowCnt);
			//console.log(arr);
			
			//render the blocks
			var maxwc = 0;
			var m = options.tileMargin;
			for(var row=0;row<arr.length;row++){
				if(arr[row].length == 0)
					continue;
				var strm = m + 'px 0 0 ' + m + 'px';
				var cwc = 0;
				var x = m;
				for(var col=0;col<arr[row].length;col++){
					var idx = arr[row][col];
					var wc = apps[idx].width;
					var w  = wc * options.tileSize + (wc-1) * m;
					var obj = $('<div class="metrosubblock"></div>').appendTo(root);
					obj.width(w).height(options.tileSize);
					obj.css('top', (m + options.tileSize) * row + m).css('left', x);
					x += w + m;
					cwc += wc;
					
					//event
					//obj.css('background', apps[idx].color[0]);
					//var bgcss = '-webkit-linear-gradient(left, '+apps[idx].color[0]+', '+apps[idx].color[1]+')';
					//console.log(bgcss);
					obj.addClass(apps[idx]['style']);
					if(apps[idx].html){
						obj.html(apps[idx].html)
					}else{
						$('<p>'+apps[idx].name+'</p>').appendTo(obj);
					}
					obj.data('myapp', apps[idx]);
					obj.click(function(){
						var url = $(this).data('myapp')['url'];
						if(!url)
							return false;
						window.open(url);
						return false;
					});
				}
				if(cwc > maxwc)
					maxwc = cwc;
			}
			root.width( maxwc * (options.tileSize + m) + m);
		}
		
		this.setContentObject = function(apps){
			$.each(apps, function(idx){
				//console.log(apps[idx].name);
			});
			
			this._apps = apps;
			//this.reinitialize();
			return this;			
		}
		
		this.setContent = function(jsonstr){
			var apps = $.parseJSON(jsonstr);
			this.setContentObject(apps);
		}
		
		this.reinitialize();
	}
})( jQuery );

//global
var scrollObj = null;

function randomStyle(){
	//var colors = ['red', 'grey', 'orange', 'green', 'blue', 'white', 'yellow', 'purple'];
	//var colors = [ ['#00ACDC', '#00BFE3'], ['#E65E20', '#EB7427'], ['#DA8515', '#E2A219'],
	// 			   ['#AA183C', '#BF1C49'], ['#5235AC', '#663FC0'], ['#54AF0E', '#68C210'],
	//			   ['#014A5B', '#025A70']];
	//return colors[Math.floor(Math.random() * colors.length)];
	return 'metroblkcolor'+Math.floor(Math.random()* 7 );
}


function genTest(){
	var cnt = 1 + Math.floor(Math.random() * 9);
	var colors = ['red', 'grey', 'orange', 'green', 'blue', 'white', 'yellow', 'purple'];
	var s = '[';
	for(var i=0;i<cnt;i++){
		var t = '{"name":"A'+i+'", "width":';
		var w = 1 + Math.floor(Math.random() * 2);
		var c = Math.floor(Math.random() * colors.length);
		t += w;
		t += ',';
		t += '"color":"'+colors[c]+'"';
		t += '}'
		if(i!=0)
			s += ',';
		s += t;
	}
	s += ']';
	//console.log(s);
	return s;
}

function GetURLParameter(sParam)
{
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) 
    {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) 
        {
            return sParameterName[1];
        }
    }
}

var Bilibili = {
	userinfo: null,
	PUBLIC_KEY: 'efbc894df29d3be9c08940be6f480a3d',
	
	getLoginURL: function(){
		return 'https://secure.bilibili.tv/login.php?api=http://59.66.131.21:3000/logincb&hash=' + this.PUBLIC_KEY + '&ver=2';
	},
	
	channels: [ 1,3,4,5,11, 13 ],
	
	renderList: function (tid, data){
		function biliList2MetroApp(){
			if(data['list']==null)
				return [];
				
			//var twocnt = Math.floor(data['list'].length / 3);
			//console.log(data);
			var cnt = 0;
			var l = [];
			$.each(data['list'], function(key, value){
				if(/^\d+$/.test(key)){
					var o = {
						_ranking: parseInt(key),
						style: randomStyle(),
						name:  value['title'],
						_aid:   value['aid'],
						width:  1,
						url:   'http://www.bilibili.tv/video/av' + value['aid'] + '/'
					};
					cnt += 1;
					l.push(o);
				}
			});
			
			l.sort(function(x,y){
				return x._ranking - y._ranking;
			});
			
			for(var i=0;i<cnt/3;i++){
				l[i].width = 2;
			}
			
			//build titleblock
			if(!data['name']){
				data['name'] = '?'
			}
			var o = {
					_ranking: 9999,
					style: randomStyle() + " metro-title-block",
					name:  data['name'],
					html: '<div class="metro-title-block-child">'+data['name'].substr(0,4)+'</div>',
					width:  2
			};
			l.push(o);
			
			function shuffle(v){
			    for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
			    return v;
			};
			
			return shuffle(l);
		}
		
		//console.log(data);
		if(data['num'] < 1)
			return;
		data._tid = tid;
		//create big block
		
		//this code make sure the order of channels is determined
		var afterMe = null;
		$('.metroblock', $('#contentinner')).each(function(){
			if($(this).data('biliObj')._tid > tid){
				afterMe = $(this);
				return false;
			}
		});
		
		var obj = $('<div class="metroblock"></div>')
		if(!afterMe)
			obj.appendTo('#contentinner')
		else
			obj.insertBefore(afterMe);
		obj.jMetroBlock();
		obj.data('biliObj', data);
		obj.jMetroBlock('setContentObject', biliList2MetroApp(tid, data));
	/*	obj.mouseenter(function(){
			$("#title").fadeOut('fast', function() {
			  $(this).text(obj.data('biliObj')['name']).fadeIn('fast');
			});
		});*/
		
		setBlocksHeight();
		obj.jMetroBlock('reinitialize');
		setInnerWidth();
		if(scrollObj)
			scrollObj.reinitialize(true);		
	},
	
	//channels: [1],
	fetchList: function(tid, pagesize, page, order){
		var url = '/bilibiliapi/list?type=json&tid=' + tid;
		if(pagesize)
			url += '&pagesize=' + pagesize;
		if(page)
			url += '&page=' + page;
		if(order)
			url += '&order=' + order;
		var that = this;
		$.getJSON(url, function(data) {
			that.renderList(tid, data);
		});

	},
	
	startFetchHotList: function(){
		for(var i=0;i<this.channels.length;i++){
			var cnt = 8 + Math.floor(Math.random()*12);
			this.fetchList(this.channels[i], cnt, 1, 'default')
		}
	}
	
};

$(document).ready(function(){
	/*
	for(var i=0;i<8;i++){
		var obj = $('<div class="metroblock"></div>').appendTo('#contentinner').jMetroBlock();
		obj.jMetroBlock('setContent', genTest());
	}
	*/
	setBlocksHeight();
	//$('.metroblock').width(400);
	
	$('.metroblock').jMetroBlock('reinitialize');
	setInnerWidth();
	scrollObj = $('#main-scroll').jMainScroll($('#content'), $('#contentinner'));
	
	$(window).resize(function(){
		setBlocksHeight();
		$('.metroblock').jMetroBlock('reinitialize');
		setInnerWidth();
		if(scrollObj)
			scrollObj.reinitialize(true);
	});
	
	$('#titleblock').click(function(){
		$('.metroblock').jMetroBlock('setVisibility', false);
	});
	
	$('#username').click(function(){
		window.location.replace(Bilibili.getLoginURL());
	});

	$.getJSON('/userinfo.json', function(data) {
		if(!data['mid']){
			$('#userinfo').text('Offline');
		}else{
			Bilibili.userinfo = data;
			$('#username').unbind('click').text(data['uname']);
			$('#user-image').attr('src', data['face']);
			$('#userinfo').text('Rank:'+data['rank']+' MID:'+data['mid']);
		}
	});
	
	Bilibili.startFetchHotList();
});

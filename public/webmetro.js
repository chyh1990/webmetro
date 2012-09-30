//helper
function getMarginOrPadding(elem, tag){
	return parseInt(elem.css(tag).replace('px'));
}

String.prototype.trim = function()
{
    return this.replace(/(^[\\s]*)|([\\s]*$)/g, "");
}

function getLabel(str, len) {
        if (str.length * 2 <= len) {
            return str;
        }
        var strlen = 0;
        var s = "";
        for (var i = 0; i < str.length; i++) {
            if (str.charCodeAt(i) > 128) {
                strlen = strlen + 2;
                if (strlen > len) {
                    return s.substring(0, s.length - 1) + "...";
                }
            }
            else {
                strlen = strlen + 1;
                if (strlen > len) {
                    return s.substring(0, s.length - 2) + "...";
                }
            }
            s = s + str.charAt(i);
        }
        return  s;
}

function getBlocksWidth(){
	var w = 0;
	$('.metroblock', $('#contentinner')).each(function(){
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
				var f = vs / (cs+0.01);
				if(f >= 1.0){
					pos = 0;
				}else{
					if(pos < 0 ){
						pos = 0;
					}else if(pos > cs - vs){
						pos = cs - vs;
					}
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
					bar.css('width', '0px');
					return obj;
				}
				var myw = this._track.width();
				var barw = vs / cs * myw;
				bar.css('width', barw + 'px');
				if(resetPos){
					this._pos = 0.0;
					this._content.css('left', '0px');
				}else{
					if(this._pos >= cs - vs)
					this._pos = cs - vs - 0.01;
				}
				this.setPosition(this._pos);
			},
			getPosition: function(){
				return this._pos;
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
		/*
		reinitialize: function() {
			return this.each(function(){
				var $this = $(this),
				data = $this.data('metroblk');
				if(data){
					data.obj.reinitialize();
				}
			});			
		},
		*/
		rearrange: function() {
			return this.each(function(){
				var $this = $(this),
				data = $this.data('metroblk');
				if(data){
					data.obj.rearrange();
				}
			});			
		},		
		
		setVisibility: function(show, callback){
			return this.each(function(){
				var $this = $(this),
				data = $this.data('metroblk');
				if(!data)
					return;
				if(show)
					$this.show();
				$('.metrosubblock', $this).each(function(){
					var caller = $(this);
					setTimeout(function(){
						if(show == true)
							caller.fadeIn(100);
						else
							caller.fadeOut(100);
					}, Math.random() * 200)
				});
				setTimeout(function(){
					if(!show)
						$this.hide();
					if(callback)
						callback($this);
				}, 400);
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
			if(rowCnt<=0){
				console.error('rowCnt<=0');
				return [];
			}
			var l = [];
			var shortRow = 0;
			var rowW = [];
			for(var i=rowCnt-1;i>=0;i--){
				l[i] = [];
				rowW[i] = 0;
			}
			//console.log(rowCnt);
			
			for(var i=0;i<apps.length;i++){
				rowW[shortRow] += apps[i].width;
				l[shortRow].push(i);
				shortRow = rowW.indexOf(Math.min.apply(Math, rowW));
			}
			return sortRowsByWidth(apps, l);
		}
		
		this.arrangeFunc = arrangeBlocks1;
		
		this.rearrange = function(){
			if(this._apps == null)
				return;
			var root = this.oWrapper;
			var options = this.options;
			var apps = this._apps;
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
					var obj = $('.metrosubblock:nth-child('+(idx+1)+')', root);
					obj.width(w).height(options.tileSize);
					obj.css('top', (m + options.tileSize) * row + m).css('left', x);
					x += w + m;
					cwc += wc;
				}
				if(cwc > maxwc)
					maxwc = cwc;
			}
			root.width( maxwc * (options.tileSize + m) + m);
		}
		
 		this.initialize = function(){
			this.oWrapper.empty();
			if(this._apps == null)
				return;
			var root = this.oWrapper;
			var options = this.options;
			var apps = this._apps;
			root.css('min-height', options.tileSize + options.tileMargin * 2);

			for(var idx=0;idx<apps.length;idx++){
					var obj = $('<div class="metrosubblock"></div>').appendTo(root);
					var wc = apps[idx].width;
					var w  = wc * options.tileSize + (wc-1) * options.tileMargin;
					obj.width(w).height(options.tileSize);
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
					
					obj.mouseenter(function(){
						$(this).addClass('metrosubblock-over');
					});
					obj.mouseleave(function(){
						$(this).removeClass('metrosubblock-over');
					});
					
					if(apps[idx].onclick){
						obj.click(function(){
							var o = $(this).data('myapp');
							if(o && o.onclick)
								o.onclick(o);
						});
					}else{
						obj.click(function(){
							var url = $(this).data('myapp')['url'];
							if(!url)
								return false;
							window.open(url);
							return false;
						});
					}
			}
		
			
			//preload the image
			$('img.lazyload', root).each(function(){
				if($(this).attr('src') == $(this).attr('data-original')){
					return;
				}
				var img = new Image();
				var that = $(this);
				img.onload = function(){
					that.attr('src', that.attr('data-original'));
				}
				img.src = $(this).attr('data-original');

			});
		}
		
		this.setContentObject = function(apps){
			$.each(apps, function(idx){
				//console.log(apps[idx].name);
			});
			
			this._apps = apps;
			this.initialize();
			return this;			
		}
		
		this.setContent = function(jsonstr){
			var apps = $.parseJSON(jsonstr);
			this.setContentObject(apps);
		}
		
		//this.reinitialize();
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

function refreshMetro(newpos){
	setBlocksHeight();
	$('.metroblock', $('#contentinner')).jMetroBlock('rearrange');
	setInnerWidth();
	if(scrollObj){
		scrollObj.reinitialize(true);
		//if(newpos)
		//	scrollObj.setPosition(newpos);
	}
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
	
	state: 'START',
	
	getLoginURL: function(){
		return 'https://secure.bilibili.tv/login.php?api=http://59.66.131.21:3000/logincb&hash=' + this.PUBLIC_KEY + '&ver=2';
	},
	
	//anime, music, game
	//channels: [ 1,3,4,5,11, 13 ],
	channels: {
		1: {"name":"Anime", "icon": "images/anime.png"},
		3: {"name":"Music", "icon" : 'images/music.png'},
		4: {"name":"Game", "icon": "images/game.png"},
		5: {"name": "Entertainment"},
		11: {"name": "Album", "icon":"images/album.png"},
		13: {"name": "Bangumi"},
		23: {"name": "Movie"}
	},
	
	renderList: function (tid, data, parentnode, insertPos){
		var that = this;
		function biliList2MetroApp(){
			if(data['list']==null){
				return [];
			}
				
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
						_bili:  value,
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
			
			//console.log(data['name']);
			
			for(var i=0;i<cnt/4;i++){
				l[i].width = 2;
			}
			//we use lazyload plugin to load images
			for(var i=0;i<cnt;i++){
				if(l[i].width == 1){
					var t=Math.floor(Math.random()*2)
					switch(t){
						case 0:
						l[i].style += ' metro-block-content-w1-0';
						l[i].html = $('<img></img>').addClass('metro-block-content-w1-0 lazyload').attr('data-original', l[i]._bili['pic'])
								.attr('src', 'images/loading150.gif').height(160).width(160).prop('outerHTML');
						break;
						case 1:
							var o = $('<div>').addClass('metro-block-content-w1-1');
							$('<h3></h3>').text( getLabel(l[i]['name'].trim(), 40) ).addClass('video-title').appendTo(o);
							$('<p></p>').text('Play: ' + l[i]._bili['play']).appendTo(o);
							var datestr = l[i]._bili['create'];
							if(datestr)
								datestr = datestr.split(/\s+/)[0];
							else
								datastr = '--';
							$('<p></p>').addClass('video-info').text('Time: ' + (l[i]._bili['duration'] || '--')).appendTo(o);
							$('<p></p>').addClass('video-info').text('Date: ' + datestr).appendTo(o);
							l[i].html = o.prop('outerHTML');
					}
					//l[i].html = '<img class="metro-block-content-w1-0" src="' + l[i]._bili['pic'] + '"></img>'
					//l[i].html = '';
				}else if(l[i].width == 2){
					var o = $('<div>').addClass('metro-block-content-w2-0');
					$('<img>').addClass('metro-block-content-w2-0-pv lazyload').attr('data-original', l[i]._bili['pic'])
								.attr('src', 'images/loading90_70.gif').height(70).width(90).appendTo(o);
					$('<div>').addClass('metro-block-content-w2-0-title video-title').text(l[i]['name']).appendTo(o);
					var info = $('<div>').addClass('metro-block-content-w2-0-info video-info').appendTo(o);
					$('<div>').addClass('metro-block-content-w2-0-info-sub').text('Time: ' + (l[i]._bili['duration']||'--')).appendTo(info);
					$('<div>').addClass('metro-block-content-w2-0-info-sub').text('Play: ' + l[i]._bili['play']).appendTo(info);
					$('<div>').addClass('metro-block-content-w2-0-desc').text(l[i]._bili['description']).appendTo(o);
					l[i].html = o.prop('outerHTML');
				}
			}
			
			//build titleblock
			if(!data['name']){
				data['name'] = '?';
				
			}
			var html = '';
			var parent_style = "metro-title-block-text";
			if(tid>0 && that.channels[tid] && that.channels[tid]["icon"]){
				html = '<img  class="metro-title-block-logo-child" src="'+that.channels[tid].icon+
						'"></img><div class="metro-title-block-logo-child-text">'+data['name']+'</div>';
				parent_style = "metro-title-block-logo";
			}else{
				var name = data['name'] || '?'
				html = '<div class="metro-title-block-text-child">'+name.substr(0,5)+'</div>';
			}
			var o = {
					_ranking: 9999,
					style: randomStyle() + " " + parent_style,
					name:  data['name'],
					html: html,
					width:  2,
					onclick: function(o){
						alert(o['name'])
					}
			};
			l.push(o);
			
			function shuffle(v){
			    for(var j, x, i = v.length; i; j = parseInt(Math.random() * i), x = v[--i], v[i] = v[j], v[j] = x);
			    return v;
			};
			
			return shuffle(l);
		}
		
		if(!data){
			console.error('data empty');
			return;
		}
		//console.log(data);
		//if(data['num'] < 1)
		//	return;
		data._tid = tid;
		//create big block

		
		var obj = $('<div class="metroblock"></div>')

		obj.jMetroBlock();
		obj.data('biliObj', data);
		obj.jMetroBlock('setContentObject', biliList2MetroApp());
	/*	obj.mouseenter(function(){
			$("#title").fadeOut('fast', function() {
			  $(this).text(obj.data('biliObj')['name']).fadeIn('fast');
			});
		});*/
		
		
		//this code make sure the order of channels is determined
		var afterMe = null;
		
		/*
		$('.metroblock', $('#contentinner')).each(function(){
			if($(this).data('biliObj')._tid > tid){
				afterMe = $(this);
				return false;
			}
		});
		*/
		if(!parentnode)
			parentnode = '#contentinner';
		if(!afterMe)
			if(insertPos == 'front')
				obj.prependTo(parentnode);
			else
				obj.appendTo(parentnode);
		else{
			obj.insertBefore(afterMe);
		}
		//setBlocksHeight();
		obj.height($('#content').height());
		obj.jMetroBlock('rearrange');
		//obj.hide();
		setInnerWidth();
		//obj.jMetroBlock('setVisibility', true);
		if(scrollObj)
			scrollObj.reinitialize(false);		
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
			//console.log(Bilibili.currentStartNode);
			that.renderList(tid, data, Bilibili.currentStartNode);
		});

	},
	
	startFetchHotList: function(){
		var that = this;
		$.each(this.channels, function(key, value){
			var cnt = 12 + Math.floor(Math.random()*12);
			that.fetchList(key, cnt, 1, 'default');		
		});
	},
	stateTable : {
		'START':
		{'SEARCH': function(){
			$('#hide-start').data('currentpos', scrollObj.getPosition());
			$('.metroblock', $('#contentinner')).jMetroBlock('setVisibility', false, function(){
				Bilibili.currentStartNode = '#hide-start';
				$('.metroblock', $('#contentinner')).detach().prependTo('#hide-start');
				//refreshMetro();
				//$('#contentinner').width(0.1);
				scrollObj.reinitialize(true);
			});
			$('#searchbox').show();
		} } ,
		
		'SEARCH':
		{'START': function(){
			Bilibili.searchCancelled = true;
			//remove all results
			$('#contentinner').empty();
			$('.metroblock', $('#hide-start')).detach().prependTo('#contentinner');
			//setInnerWidth();
			refreshMetro();
			Bilibili.currentStartNode = '#contentinner';
			scrollObj.setPosition($('#hide-start').data('currentpos'));
			$('.metroblock', $('#contentinner')).jMetroBlock('setVisibility', true, function(){
				
				//scrollObj.setPosition($('#hide-start').data('currentpos'));
			});
			$('#searchbox').hide();
			//scrollObj.setPosition(0);
		}},
	},	
	
	transferTo: function(nextState){
		if(this.state == nextState){
			return;
		}
		if(this.stateTable[this.state][nextState]){
			this.stateTable[this.state][nextState]();
			var that = this;
			$("#title").fadeOut(100, function() {
			  that.state = nextState;
			  var title = nextState.toLowerCase();
			  title = title.substr(0,1).toUpperCase() + title.substr(1);
			  $(this).text(title).fadeIn(100);
			});
		}else{
			console.log('illegal transfer');
		}
		return;
	},
	
	getState: function(){
		return this.state;
	},
	
	toggleSearch: function(){
		if(this.state == 'START')
			this.transferTo('SEARCH');
		else
			this.transferTo('START');
	},
	
	searchCancelled: false,
	
	startSearch: function(keyword){
		if(!keyword)
			return;
		$("#title").text('Search...');
		this.searchCancelled = false;
		var that = this;
		$.getJSON('/bilibiliapi/search?keyword=' + keyword, function(data) {
			if(that.searchCancelled){
				return;
			}
			$("#title").text('Search');
			if(!data || data['code'] != 0){
				alert('failed');
			}else{
				data.list = data.result;
				data['name'] = 'Find';
				that.renderList(0, data, '#contentinner', 'front');
			}
		});	
	},
	
	init: function(){
		var that = this;
		this.currentStartNode = '#contentinner';
		$("#title").text('Start');
		$("#searchbox").hide();
		$('#search-text').keypress(function (e) {
		  if (e.which == 13) {
			that.startSearch($('#search-text').val());
			$('#search-btn').focus();
		    e.preventDefault();
		  }
		});
		$('#search-btn').click(function(){that.startSearch($('#search-text').val())});
	    $('#search-text').focus(function() { // select text on focus
	        $(this).select(); 
	    });
	    $('#search-text').mouseup(function(e){ // fix for chrome and safari
	        e.preventDefault();
	    });
	},
	
};

$(document).ready(function(){
	/*
	for(var i=0;i<8;i++){
		var obj = $('<div class="metroblock"></div>').appendTo('#contentinner').jMetroBlock();
		obj.jMetroBlock('setContent', genTest());
	}
	*/
	
	Bilibili.init();
	setBlocksHeight();
	//$('.metroblock').width(400);
	
	//$('.metroblock').jMetroBlock('rearrange');
	setInnerWidth();
	scrollObj = $('#main-scroll').jMainScroll($('#content'), $('#contentinner'));
	
	$(window).resize(function(){
		refreshMetro();
	});
	
	$('#title').click(function(){
		Bilibili.toggleSearch();
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

function getBlocksWidth(){
	var w = 0;
	$('.metroblock').each(function(){
		w += $(this).outerWidth(true);
	});
	w += 40;
	return w;
}

function setBlocksHeight(){
	var h = $('#content').innerHeight() - 80;
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
		setContent : function(jsonStr) {
			return this.each(function(){
				var $this = $(this),
				data = $this.data('metroblk');
				if(data){
					data.obj.setContent(jsonStr);
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
		
		function arrangeBlocks(apps, rowCnt){
			var l = [];
			var rc = 0;
			for(var i=0;i<apps.length;i++){
				if(l[rc] == null) l[rc] = [];
				l[rc].push(i);
				rc = (rc + 1) % rowCnt;
			}
			return sortRowsByWidth(apps, l);
		}
		
		this.arrangeFunc = arrangeBlocks;
		
 		this.reinitialize = function(){
			this.oWrapper.empty();
			if(this._apps == null)
				return;
			var root = this.oWrapper;
			var options = this.options;
			var apps = this._apps;
			root.css('min-height', options.tileSize + options.tileMargin * 2);
			var totalH = root.height();
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
				for(var col=0;col<arr[row].length;col++){
					var idx = arr[row][col];
					var wc = apps[idx].width;
					var w  = wc * options.tileSize + (wc-1) * m;
					var obj = $('<div class="metrosubblock"></div>').appendTo(root);
					obj.width(w).height(options.tileSize).css('margin', strm).css('background', apps[idx].color);
					$('<p>'+apps[idx].name+'</p>').appendTo(obj);
					cwc += wc;
				}
				if(cwc > maxwc)
					maxwc = cwc;
			}
			root.width( maxwc * (options.tileSize + m) + m);
		}
		
		this.setContent = function(jsonstr){
			var apps = $.parseJSON(jsonstr);
			$.each(apps, function(idx){
				//console.log(apps[idx].name);
			});
			
			this._apps = apps;
			//this.reinitialize();
			return this;
		}
		
		this.reinitialize();
	}
})( jQuery );

//global
var scrollObj = null;

$(window).resize(function(){
	setBlocksHeight();
	$('.metroblock').jMetroBlock('reinitialize');
	if(scrollObj)
		scrollObj.reinitialize(true);
});

function genTest(){
	var cnt = 2 + Math.floor(Math.random() * 8);
	var colors = ['red', 'grey', 'orange', 'green', 'blue', 'white', 'yellow', 'purple'];
	var s = '[';
	for(var i=0;i<cnt;i++){
		var t = '{"name":"A'+i+'", "width":';
		var w = 1 + Math.floor(Math.random() * 3);
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
	console.log(s);
	return s;
}

$(document).ready(function(){
	for(var i=0;i<6;i++){
		var obj = $('<div class="metroblock"></div>').appendTo('#contentinner').jMetroBlock();
		obj.jMetroBlock('setContent', genTest());
	}
	setBlocksHeight();
	//$('.metroblock').width(400);
	
	$('.metroblock').jMetroBlock('reinitialize');
	$('#contentinner').width(getBlocksWidth());
	scrollObj = $('#main-scroll').jMainScroll($('#content'), $('#contentinner'));

});
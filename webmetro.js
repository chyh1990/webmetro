function getBlocksWidth(){
	var w = 0;
	$('.block').each(function(){
		w += $(this).outerWidth(true);
	});
	return w;
}

function setBlocksHeight(){
	var h = $('#content').innerHeight() - 120;
	$('.block').height(h);
}

(function( $ ) {
	$.fn.jMainScroll = function(viewport, content) {
		var obj = {
			_pos: 0,
			_view: viewport,
			_content: content,
			_ratio: 1.0,
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
			}
		};
		var vs = viewport.width()
		, cs = content.width();
		obj._ratio = vs / cs;
		if(obj._ratio >= 1.0){
			return obj;
		}
		this.css('margin', '0').css('padding', '0');
		var bar = $('<div class="main-scroll-bar" style="margin:0;padding:0;"></div>').appendTo(this);
		bar.css('height', '100%').css('position','absolute').css('top', '0');
		var myw = this.width();
		var barw = vs / cs * myw;
		bar.css('width', barw + 'px');
		obj._bar = bar;
		content.mousewheel(function(event, delta, deltaX, deltaY) {
			var v = deltaX;
			if(Math.abs(v)<0.00001)
				v = -deltaY;
		    obj.setDelta(v * 20);
			//console.log(delta, deltaX, deltaY);
			event.preventDefault();
		});		
		return obj;
	};
})( jQuery );

$(window).resize(function(){
	setBlocksHeight();
});

$(document).ready(function(){
	for(var i=0;i<10;i++){
		$('<div class="block">AAA'+i+'</div>').appendTo('#contentinner');
	}
	setBlocksHeight();
	$('.block').width(400);
	$('#contentinner').width(getBlocksWidth());
	
	var scrollObj = $('#main-scroll').jMainScroll($('#content'), $('#contentinner'));
	// using the event helper

});
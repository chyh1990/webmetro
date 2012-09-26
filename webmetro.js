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
});
/* Nov. 2016 - Sunsoo, NHN Technology Services UIT Development Division */

'use strict';

(function() {

	var ua = navigator.userAgent;
	var doc = document;
	var html = doc.getElementsByTagName('HTML')[0];

	html.setAttribute('data-user-agent',ua);

	// Table of contents 만들기 - h2까지만 파싱
	var toc = doc.getElementById('table-of-contents');
	var tocSub = doc.getElementById('table-of-contents-sub');
	var section = doc.getElementById('section');
	var articles = section.getElementsByTagName('article');

	function createToc(){
		for(var i=0;i<articles.length;i++){
			var num1 = i+1;
			var this1 = articles[i].getElementsByTagName('h1')[0];
			var heading1st = this1.innerText;
			this1.innerText = num1+'. '+heading1st;
			var heading1stId = heading1st.replace(/ /gi,'').replace(/\,/gi,'').replace(/\!/gi,'').replace(/\?/gi,'');
			this1.setAttribute('id',heading1stId);

			var createNode = doc.createElement('a');
			var createNodeText = doc.createTextNode(this1.innerText);
			createNode.appendChild(createNodeText)
			toc.appendChild(createNode);
			createNode.setAttribute('href','#'+heading1stId);
			createNode.setAttribute('class','lv1');

			var heading2ndAll = articles[i].getElementsByTagName('h2');
			for(var j=0;j<heading2ndAll.length;j++){
				var num2 = j+1;
				var this2 = heading2ndAll[j];
				var heading2nd = this2.innerText;
				this2.innerText = num1+'.'+num2+'. '+heading2nd;
				var heading2ndId = heading2nd.replace(/ /gi,'').replace(/\,/gi,'').replace(/\!/gi,'').replace(/\?/gi,'');
				this2.setAttribute('id',heading2ndId);

				var createNode = doc.createElement('a');
				var createNodeText = doc.createTextNode(this2.innerText);
				createNode.appendChild(createNodeText)
				toc.appendChild(createNode);
				createNode.setAttribute('href','#'+heading2ndId);
				createNode.setAttribute('class','lv2');
			}
		}
		return false;
	};

	createToc();

	var tocClone = toc.cloneNode(true);
	tocSub.appendChild(tocClone);

})();

$(window).load(function(){

	$('.section a').attr('target','_blank');

	// 클릭하면 이미지 확대보기
	var figureWideViewWidthLimit = 800;
	if(document.body.clientWidth > figureWideViewWidthLimit){
		$('.section figure img').click(function figureWideView(){
			var img_object = $(this).html(this);
			var img_src = img_object.attr('src');
			var img_vaetical_align = -1*(img_object.context.naturalHeight/2);
			var img_center_align = -1*(img_object.context.naturalWidth/2);
			$('.img-viewer .img-viewer-inner').append('<img src='+img_src+' alt="확대이미지">');
			$('.img-viewer .img-viewer-inner').css({
				'margin-top':img_vaetical_align+'px',
				'margin-left':img_center_align+'px',
				'width':img_object.context.naturalWidth+40+'px',
				'height':img_object.context.naturalHeight+40+'px'
			});
			$('.img-viewer img').css({
				'margin-top':img_vaetical_align+'px',
				'margin-left':img_center_align+'px'
			});
			$('body').css({'overflow':'hidden'});
			$('.img-viewer').fadeIn();
		});
		$('.img-viewer').click(function(){
			$('.img-viewer').hide();
			$('.img-viewer img').remove();
			$('body').css({'overflow':'auto'});
		});
	} else {
		$('.section figure img').click(function(){
			alert('브라우저 가로 사이즈가 '+figureWideViewWidthLimit+'px 이상이어야 확대보기가 가능합니다.');
		});
	}

	$('.lecture-button--pageline').click(function (e){
		e.preventDefault();
		if($(this).hasClass('is-lined')) {
			$(this).removeClass('is-lined');
			$('hr').removeClass('is-lined');
		} else {
			$(this).addClass('is-lined');
			$('hr').addClass('is-lined');
		}
	});

	$('.lecture-button--print').click(function (e){
		e.preventDefault();
		window.print();
	});

	$('.lecture-button--breaktime').click(function (e){
		e.preventDefault();
		$('body').css({'overflow':'hidden'});
		$('header').css('padding-right',scrollBarWidth+'px');
		$('.wrap-lecture').css('padding-right',scrollBarWidth+'px');
		$('footer').css('padding-right',scrollBarWidth+'px');
		$('.lecture-button--list').css('margin-right',scrollBarWidth+'px');
		$('.lecture-button--top').css('margin-right',scrollBarWidth+'px');
		$('.breaktime-viewer').fadeIn(200);
	});

	$('.breaktime-viewer').click(function(){
		$('body').css({'overflow':'auto'});
		$('header').css('padding-right',0);
		$('.wrap-lecture').css('padding-right',0);
		$('footer').css('padding-right',0);
		$('.lecture-button--list').css('margin-right',0);
		$('.lecture-button--top').css('margin-right',0);
		$(this).fadeOut(0);
	});

	$('.lecture-button--sketch').click(function (e){
		e.preventDefault();
		if($(this).hasClass('is-opened')) {
			$('body').css({'overflow':'visible'});
			$('.sketch-pad').hide();
			$(this).removeClass('is-opened');
		} else {
			$('body').css({'overflow':'hidden'});
			$('.sketch-pad').show();
			$(this).addClass('is-opened');
		}
	});

	var scrollBarWidth = window.innerWidth - $(window).width();
	$('.lecture-button--list').click(function (e){
		e.preventDefault();
		if($(this).hasClass('is-opened')) {
			$('body').css({'overflow':'auto'});
			$('header').css('padding-right',0);
			$('.wrap-lecture').css('padding-right',0);
			$('footer').css('padding-right',0);
			$('.lecture-button--list').css('margin-right',0);
			$('.lecture-button--top').css('margin-right',0);
			$('.table-of-contents-sub').animate({ 'right': '-300px' }, 500);
			$(this).removeClass('is-opened');
			$('.img-viewer').hide();
		} else {
			$('body').css({'overflow':'hidden'});
			$('header').css('padding-right',scrollBarWidth+'px');
			$('.wrap-lecture').css('padding-right',scrollBarWidth+'px');
			$('footer').css('padding-right',scrollBarWidth+'px');
			$('.lecture-button--list').css('margin-right',scrollBarWidth+'px');
			$('.lecture-button--top').css('margin-right',scrollBarWidth+'px');
			$('.table-of-contents-sub').animate({ 'right': '10px' }, 500);
			$(this).addClass('is-opened');
			$('.img-viewer').fadeIn();
		}
	});

	$('.lecture-button--top').click(function (e){
		e.preventDefault();
		$('html').animate({ scrollTop: 0 }, 500);
	});

});

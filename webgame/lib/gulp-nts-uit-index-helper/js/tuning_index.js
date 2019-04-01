(function() {

	var doc = document;
	var docCont = doc.getElementById("ct");
	var groupList = doc.getElementById("groupList");
	var groupListHeading = groupList.getElementsByTagName("h2");
	var groupListPage = groupList.getElementsByTagName("a");

	var viewUri = location.search; // ?로 시작하는 URL 끝부분 추출

	var noticeTextDefault = "1) URL 끝부분에 '?view=그룹명'을 붙이면 해당 그룹만 출력됩니다. (콤마로 구분하여 여러개 사용가능)<br>2) '?sort=그룹명'을 붙이면 순서를 조정할 수 있습니다.<br>3) view와 sort를 동시에 사용할 수는 없습니다.";
	var noticeText = noticeTextDefault;

	// h2에 id 추가
	for(var i=0;i<groupListHeading.length;i++){ // 그룹 헤딩 수 만큼 반복
		var thisListHeading = groupListHeading[i];
		thisListHeading.setAttribute("id",thisListHeading.innerText); // 아이디 부여
		thisListHeading.nextElementSibling.setAttribute("id",thisListHeading.innerText+"목록"); // 헤딩 다음에 오는 요소(ul)에 아이디 부여
	}
	for(var j=0;j<groupListPage.length;j++){ // 페이지 리스트 만큼 반복
		var thisListPage = groupListPage[j];
		var getPageHref = thisListPage.getAttribute("href").replace("src/","").replace("/","_").replace(".html","");
		thisListPage.setAttribute("id",getPageHref); // 아이디 부여
		thisListPage.setAttribute("target","_blank");
	}

	// uri 기준으로 show / hide : ?view= 뒤에 그룹명을 붙이면 해당 그룹만 출력
	if(viewUri.indexOf("?view=") != -1){
		console.log(decodeURI(viewUri));
		var viewUriArray = viewUri.replace("?view=","").split(","); // ?view= 이후에 해당하는 CSV 스타일 부분 파싱
		// hide
		for(var i=0;i<groupListHeading.length;i++){ // 그룹 수 만큼 반복 시키면서 화면에서 보이지 않게 처리
			groupListHeading[i].style.display = "none";
			groupListHeading[i].nextElementSibling.style.display = "none";
		}
		// show
		for(var i=0;i<viewUriArray.length;i++){ // ?view= 이후에 해당하는 그룹명 수 만큼 반복하면서 해당되는 부분만 다시 보이게 처리
			var idMatch = decodeURI(viewUriArray[i]);
			var idMatchHeading = doc.getElementById(idMatch); // 부여했던 아이디와 매칭여부 확인
			var idMatchList = idMatchHeading.nextElementSibling;

			idMatchHeading.style.display = "block";
			idMatchList.style.display = "block";
		}
		noticeText = noticeTextDefault + "<br>현재는 ["+decodeURI(viewUriArray)+"]그룹이 출력되었습니다. URL 끝부분에 '?view=그룹명'을 삭제하면 모든 그룹이 출력됩니다.";
	}else{
		console.log("view query is null");
	};

	// uri 기준으로 sorting : ?sort= 뒤에 그룹명을 붙이면 해당 순서로 정렬
	var sortArea = doc.createElement("div");
	sortArea.setAttribute("id","sortList"); // div#sortList를 생성하고 삽입
	doc.body.insertBefore(sortArea, docCont);
	var sortList = doc.getElementById("sortList");
	var sortArray;

	if(viewUri.indexOf("?sort=") != -1){
		console.log(decodeURI(viewUri));
		sortArray = viewUri.replace("?sort=","").split(","); // ?sort= 이후에 해당하는 CSV 스타일 부분 파싱

		innerSorting(sortArray);
		noticeText = noticeTextDefault + "<br>현재는 ["+decodeURI(sortArray)+"]순으로 정렬되었습니다.";
	}else{
		console.log("sort query is null");
		sortArray = ['웹게임']; // 정렬 순서를 따로 지정하지 않은 경우 이 순서로 삽입

		innerSorting(sortArray);
		noticeText = noticeTextDefault + "<br>현재는 기본설정인 ["+decodeURI(sortArray)+"]순으로 정렬되었습니다.";
	};

	function innerSorting(sortArray){
		for(var i=0;i<sortArray.length;i++){
			var decodeId = decodeURI(sortArray[i]);
			sortList.appendChild( doc.getElementById(decodeId) ); // 정렬 목록과 순서에 해당하는 요소를 재삽입
			sortList.appendChild( doc.getElementById(decodeId+"목록") );
		}
	}

	// notice output
	var noticeArea = doc.createElement("div");
	noticeArea.setAttribute("class","notice_area");
	noticeArea.innerHTML = "<div class='notice'>"+noticeText+"</div>";
	doc.body.insertBefore(noticeArea, sortList);

})();

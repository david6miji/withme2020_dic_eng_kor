var readline 	= require('readline');
var fs 			= require('fs');

var stardict_filename 	= "../stardict/quick_english-korean-2.4.2.dict";
var word_line_head_mark	= '<span foreground="blue" weight=\"bold\">';
var word_split_mark		= '<\/span>';

console.log( "convert format v0.1" );
console.log( "-------------------" );
console.log( "made by davidyou (frog@falinux.com)" );
console.log( "" );
console.log( ">> from stardic " );
console.log( ">> to withme_dic_step1" );

var read_file	= fs.createReadStream(stardict_filename);
var line_reader	= readline.createInterface({ input: read_file });

function trim(str) {
	return str.replace( /(^\s*)|(\s*$)/g, "" );
}

function check_hangul_in_str(str){

	var check = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
    var result = str.match(check);
			
	return result !== null;
}

function check_hangul_by_code_in_str(str){

	for(i=0; i<str.length; i++){
	    if( str.charCodeAt(i) > 0x3130 && str.charCodeAt(i) < 0x318F ){
			return true;
		}
	    if( str.charCodeAt(i) >= 0xAC00 && str.charCodeAt(i) <= 0xD7A3 ){
			return true;
		}
	}
	
	return false;
}
 
//
//  다음과 같은 처리 절차를 갖는다.
//  1. 파일에서 한 라인을 읽고 1 개 이상의 영어 단어를 포함하는 경우를 
//     처리 하여 하나의 영어 단어 라인으로 재 분류 한다. 
//  2. 영어 단어와 품사 및 뜻에 대한 부분으로 분리하여 영어 단어를 추출한다. 
//  3. 영어 단어 이외를 배열로 만든후 좌우 공백을 없앤다. 
//  4. 품사를 구분하여 배열로 만들고 품사 구분자가 아니면 한글 뜻으로 추가한다.

line_reader.on('line', function (line) {

	// 1 번째 처리 과정 
	var word_lines = line.split( word_line_head_mark );
	word_lines.forEach( function(word_line,i) {
		
		if( word_line === "" ) { return; }
//		console.log('word_line[' + i + ']' + ' = '+ word_line );
		
		// 2 번째 처리 과정 
		var word_line = word_line.split( word_split_mark );
		if( word_line.length !== 2 ) {
			console.log('please check startdict format !');
			process.exit(1);
		}
		
		var word   = {};
		word.eng   = word_line[0];
		word.parts = [];
		word.kor   = [];
		
//		console.log('word_line[0] = ' +  word.eng );
		
		// 3 번째 처리 과정
//		console.log('word_line[1] = [' +  word_line[1] + ']' );

		var items = word_line[1].split( "," );
		var phase_checking_part = true;

		items.forEach( function(item,i) {
			item = trim(item);
			if( phase_checking_part ) {
				
				if( check_hangul_in_str(item) ){
					phase_checking_part = false;
					word.kor.push( item );
				} 
				else {
//					console.log('       ' + '[' +  item + ']' );
					switch(item){
					case 'a'    : word.parts.push('a'  ); 		break; // 형용사
					case 'ad'   : word.parts.push('ad' );    	break; // 부사
					case 'aux'  : word.parts.push('aux' );    	break; // 조동사
					case 'conj' : word.parts.push('conj' );    break; // 접속사
					case 'int'  : word.parts.push('int');      break; // 감탄사
					case 'n'    : word.parts.push('n'  );     	break; // 명사
					case 'pl'   : word.parts.push('pl' );     	break; // 복수 명사
					case 'prep' : word.parts.push('prep' );   	break; // 전치사
					case 'pron' : word.parts.push('pron' );   	break; // 대명사
					case 'vi'   : word.parts.push('vi' );  	break; // 자동사
					case 'vt'   : word.parts.push('vt' );    	break; // 타동사
					case 'v'    : word.parts.push('v'  );    	break; // 동사
					case 'x'    : word.parts.push('x'  );    	break; // 복합명사
					case 'rel'  : word.parts.push('rel' );     break; // 관계사
					case 'suf'  : word.parts.push('suf' );   	break; // 접미사
					case 'pref' : word.parts.push('pref' );   	break; // 접두사

					case 'n.pl' : word.parts.push('n.pl' );    break; //
					case 'pred' : word.parts.push('pred' );   	break; // 
					case 'pi'   : word.parts.push('pi' );   	break; // 
					
					
					case ''     : break;			  
							   
					default  : if( item[0] === '=' ){
									phase_checking_part = false;
									word.kor.push( item );
								} else {
									console.log('Unknown parts ' + '[' +  item + ']' ); 
//									console.log('       word_line[0] = ' +  word.eng );  
//									console.log('       word_line[1] = [' +  word_line[1] + ']' );
								}	
								break;
					}
					
				}
				
				
			} else {
				word.kor.push( item );
			}
			
			// 4 번째 와 5 번째 처리 과정
//			console.log('       ' 
////			            +  check_hangul_in_str(item) 
//			            +  check_hangul_by_code_in_str(item) 
//						+ '[' +  item + ']' );
		});
	
//		console.log('word_line[1] = ' +  word_line[1] );
		
	});

});

line_reader.on('close', function () {
	console.log('close ----------' );
});


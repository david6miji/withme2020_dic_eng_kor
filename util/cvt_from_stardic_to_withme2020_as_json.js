var readline 	= require('readline');
var fs 			= require('fs');

var stardict_filename 	= "../stardict/quick_english-korean-2.4.2.dict";
var word_line_head_mark	= '<span foreground="blue" weight=\"bold\">';
var word_split_mark		= '<\/span>';

var withme2020_filename	= "../withme2020/withme2020_dic_meanig_eng_kor.json";

var dic   = {};
	dic.version	= "0.0.1";
	dic.create  = "2016/06/19";
	dic.update  = "2016/06/19";
	dic.license = "GPL v3";
	dic.words 	= [];

console.log( "convert format v0.1" );
console.log( "-------------------" );
console.log( "made by davidyou (frog@falinux.com)" );
console.log( "" );
console.log( ">> from stardic " );
console.log( ">> to withme2020_as_json" );

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
		
		var word   		= {};
		word.english   	= word_line[0];
		word.korean		= [];
		word.comment	= [];
		
		var parts 		= [];
		var kor   		= [];
		var comments	= [];

		var	append_comments_unknow_part = function( part ){
			comments.push( "알 수 없는 품사 기호가 있습니다. ["+part+"]");   
		}

//		console.log('word_line[0] = ' +  word.english );
		
		// 3 번째 처리 과정
//		console.log('word_line[1] = [' +  word_line[1] + ']' );

		var items = word_line[1].split( "," );
		var phase_checking_part = true;
		

		items.forEach( function(item,i) {
			item = trim(item);
			if( phase_checking_part ) {
				
				if( check_hangul_in_str(item) ){
					phase_checking_part = false;
					kor.push( item );
				} 
				else {
//					console.log('       ' + '[' +  item + ']' );
					switch(item){
					case 'n'    	: parts.push('noun' );			break; // 명사
					case 'N'    	: parts.push('noun' );			break; // 명사
					case '(n)'  	: parts.push('noun' );			break; // 명사
					case 'n.pl'   	: parts.push('noun' );			break; // 명사
					case 'pl'   	: parts.push('noun' );     		break; // 복수 명사
					case 'sing'		: parts.push('noun' );   		break; // 단수형
					case ':n'    	: parts.push('noun' ); 			break; // 명사
					case '...n'  	: parts.push('noun' ); 			break; // 명사

					case 'vi'   	: parts.push('verb' );  		break; // 자동사
					case '-col()vi'	: parts.push('verb' );  		break; // 자동사
					case 'vt'   	: parts.push('verb' );    		break; // 타동사
					case 'VT'   	: parts.push('verb' );    		break; // 타동사
					case 'v t'  	: parts.push('verb' );    		break; // 타동사
					case 'v'    	: parts.push('verb' );    		break; // 동사
					case 'V'    	: parts.push('verb' );    		break; // 동사
					case 'vt.vi'	: parts.push('verb' );   		break; // 동사
					case 'v.vi'  	: parts.push('verb' ); 			break; // 동사
					case '...vi' 	: parts.push('verb' ); 			break; // 동사
					case '...vt' 	: parts.push('verb' ); 			break; // 동사
					case 'v i'    	: parts.push('verb' ); 			break; // 동사
					case 'aux'  	: parts.push('verb' );    		break; // 조동사
					case 'auxil'	: parts.push('verb' );    		break; // 조동사

					case 'a'    	: parts.push('adjective' ); 	break; // 형용사
					case 'A'    	: parts.push('adjective' ); 	break; // 형용사
					case ':a'    	: parts.push('adjective' ); 	break; // 형용사
					case 'a)'    	: parts.push('adjective' ); 	break; // 형용사
					case '...a'  	: parts.push('adjective' ); 	break; // 형용사
					
					case 'ad'   	: parts.push('adverb' );    	break; // 부사
					case 'a d'    	: parts.push('adverb' ); 		break; // 부사
					
					case 'conj' 	: parts.push('conjuction' );	break; // 접속사
					
					case 'int'  	: parts.push('interjection' );	break; // 감탄사

					case 'prep' 	: parts.push('prepositon' );   	break; // 전치사
					
					case 'pron' 	: parts.push('pronoun' );   	break; // 대명사
					case 'indef'	: parts.push('pronoun' );   	break; // 부정(不定) 대명사

					// ----------------------------------------------------------------
					case 'vn'   	: parts.push('noun' );   
									  parts.push('verb' );   	 
									  break; //

					case 'va'   	: parts.push('verb' );   
									  parts.push('adjective' );   	 
									  break; //
									  
					case 'n.a'   	: parts.push('noun' );   
									  parts.push('adjective' );   	 
									  break; //

					case 'na'   	: parts.push('noun' );   
									  parts.push('adjective' );   	 
									  break; //

					case 'a.n'   	: parts.push('noun' );   
									  parts.push('adjective' );   	 
									  break; //

					case 'a n'   	: parts.push('noun' );   
									  parts.push('adjective' );   	 
									  break; //
								  
					case 'n\vt'		: parts.push('noun' );   
									  parts.push('verb' );   	 
									  break; //

					case 'n.vt'   	: parts.push('noun' );   
									  parts.push('verb' );   	 
									  break; //

					case 'n.ad'   	: parts.push('noun' );   
									  parts.push('adverb' );   	 
									  break; //

					case 'vtn'   	: parts.push('verb' );   
									  parts.push('noun' );   	 
									  break; //
									  
					case 'a.ad'   	: parts.push('adjective' );   
									  parts.push('adverb' );   	 
									  break; //
									  
					case 'a.vt'   	: parts.push('adjective' );   
									  parts.push('verb' );   	 
									  break; //
									  
					case 'a.vi'   	: parts.push('adjective' );   
									  parts.push('verb' );   	 
									  break; //
									  
					case 'nad'   	: parts.push('noun' );   
									  parts.push('adverb' );   	 
									  break; //
									  
					// ----------------------------------------------------------------
					

					case 'x\a'		: parts.push('unknow' );   
									  parts.push('adjective' );   	 
									  append_comments_unknow_part('x' );
									  break; //

					case 'x.vt'   	: parts.push('unknow' );   
									  parts.push('verb' );   	 
									  append_comments_unknow_part('x' );
									  break; //

					case 'xn'   	: parts.push('unknow' );   
									  parts.push('noun' );   	 
									  append_comments_unknow_part('x' );
									  break; //

				case 'x'    	: parts.push('unknow'  ); append_comments_unknow_part('x' ); break; // 복합명사
				case 'X'    	: parts.push('unknow'  ); append_comments_unknow_part('x' ); break; // 복합명사

				case 'rel'  	: parts.push('unknow' ); append_comments_unknow_part('rel' ); break; // 관계사

				case 'suf'  	: parts.push('unknow' ); append_comments_unknow_part('suf' ); break; // 접미사
				case 'pref' 	: parts.push('unknow' ); append_comments_unknow_part('pref' ); break; // 접두사
					
					case 'pred' 	: parts.push('unknow' ); append_comments_unknow_part('pred' );	break;
					case 'pi'   	: parts.push('unknow' ); append_comments_unknow_part('pi'   );	break;
					case 'pt'   	: parts.push('unknow' ); append_comments_unknow_part('pt'   );	break;
					case 'ti'   	: parts.push('unknow' ); append_comments_unknow_part('ti'   );	break;
					case 'xint' 	: parts.push('unknow' ); append_comments_unknow_part('xint' );	break;
					case 'xprep'	: parts.push('unknow' ); append_comments_unknow_part('xprep');	break;
					case 'xconj'	: parts.push('unknow' ); append_comments_unknow_part('xconj');	break;
					case 'xbent'	: parts.push('unknow' ); append_comments_unknow_part('xbent');	break;
					case 'xa'		: parts.push('unknow' ); append_comments_unknow_part('xa'	);	break;
					case 's'		: parts.push('unknow' ); append_comments_unknow_part('s'	);	break;
					case 'd'		: parts.push('unknow' ); append_comments_unknow_part('d'	);	break;
					case 'z'		: parts.push('unknow' ); append_comments_unknow_part('z'	);	break;
					case 'in'		: parts.push('unknow' ); append_comments_unknow_part('in'	);	break;
					case 'dn'		: parts.push('unknow' ); append_comments_unknow_part('dn'	);	break;
					case 'an'		: parts.push('unknow' ); append_comments_unknow_part('an'	);	break;
					case 'f'		: parts.push('unknow' ); append_comments_unknow_part('f'	);	break;
					case 'q'		: parts.push('unknow' ); append_comments_unknow_part('q'	);	break;
					case 'b'		: parts.push('unknow' ); append_comments_unknow_part('b'	);	break;
					case 'm'		: parts.push('unknow' ); append_comments_unknow_part('m'	);	break;
					case 'c'		: parts.push('unknow' ); append_comments_unknow_part('c'	);	break;
					case 'adv'		: parts.push('unknow' ); append_comments_unknow_part('adv'	);	break;
					case 'as'		: parts.push('unknow' ); append_comments_unknow_part('as'	);	break;
					case 'ints'		: parts.push('unknow' ); append_comments_unknow_part('ints'	);	break;
					case 'avt'		: parts.push('unknow' ); append_comments_unknow_part('avt'	);	break;
					case 'av'		: parts.push('unknow' ); append_comments_unknow_part('av'	);	break;
					case 'cost'		: parts.push('unknow' ); append_comments_unknow_part('cost'	);	break;
					
					case ''     	: break;
					
					default  : if( item[0] === '=' ){
									phase_checking_part = false;
									kor.push( item );
								} else {
									kor.push( item );
//									console.log('Unknown parts ' + '[' +  item + ']' ); 
//									console.log('       word_line[0] = ' +  word.eng );  
//									console.log('       word_line[1] = [' +  word_line[1] + ']' );
								}	
								break;
					}
					
				}
				
				
			} else {
				kor.push( item );
			}
			
			// 4 번째 와 5 번째 처리 과정
//			console.log('       ' 
////			            +  check_hangul_in_str(item) 
//			            +  check_hangul_by_code_in_str(item) 
//						+ '[' +  item + ']' );
		});
	
//		console.log('word_line[1] = ' +  word_line[1] );
		//	
		// 하나의 단어를 사전 객체에 넣는다. 
		//
		var part = '';
		
		if( ( parts.length == 1 ) && ( parts[0] !== "unknow" ) ){
			part = 	parts[0];
		} else {
			part = 	"unknow";
			var parts_string = parts.toString();
			comments.push( "품사를 검토해 주세요 ["+parts_string+"]");   
		}
		
		kor.forEach( function(item,i) {
			var korean = {};
			korean.part 	= part; 
			korean.meaning 	= item; 

			word.korean.push( korean );
		});
		
		word.comment	= comments;
		
		dic.words.push( word );
		
	});

});

line_reader.on('close', function () {
	console.log('close ----------' );
	
	fs.writeFile( withme2020_filename, JSON.stringify(dic, null, 4),  function(err) {
		if(err) {
			console.log(err);
		} else {
			console.log("JSON saved to " + withme2020_filename );
		}
	});

});


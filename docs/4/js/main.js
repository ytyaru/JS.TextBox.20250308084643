window.addEventListener('DOMContentLoaded', (event) => {
    console.log('DOMContentLoaded!!');
    const author = 'ytyaru';
    van.add(document.querySelector('main'), 
        van.tags.h1(van.tags.a({href:`https://github.com/${author}/JS.TextBox.20250308084643/`}, 'TextBox')),
        van.tags.p('textareaを拡張してインデント可能にしたUI。'),
//        van.tags.p('A UI that extends textarea to enable indentation.'),
    );
    van.add(document.querySelector('footer'),  new Footer('ytyaru', '../').make());

    const a = new Assertion();
    a.t(true);
    a.f(false);
    a.e(TypeError, `msg`, ()=>{throw new TypeError(`msg`)});
    a.fin();

    const code = `alert('Hello JavaScript !!');

console.log('Hello JavaScript !!');
`
    
    document.querySelector(`main`).append(
        van.tags.select({onchange:(e)=>{
            if ('TAB'===e.target.value){tai.setHardTab()}
            else if ('Space-2'===e.target.value){tai.setSoftTab(2)}
            else if ('Space-4'===e.target.value){tai.setSoftTab(4)}
        }}, ...['TAB', ...[2,4].map(n=>`Space-${n}`)].map(v=>van.tags.option({value:v}, v))),
        van.tags.label(van.tags.input({type:'checkbox', onchange:(e)=>tai.isTargetEmptyLines = e.target.checked}), '空行もインデント対象にする'),
        van.tags.br(),
        van.tags.textarea({style:`width:50%;height:${Math.floor(document.documentElement.clientHeight/4)}px;resize:none;`}, code),
        van.tags.textarea({style:`width:50%;height:${Math.floor(document.documentElement.clientHeight/4)}px;resize:none;`}, code),
    );

    const tai = new TextareaIndent();
    tai.setup();
//    tai.tab = 'x' // NG
//    tai.tab = '\t\t' // NG
    tai.tab = '  ' // OK
    tai.tab = '    ' // OK
    tai.tab = '\t' // OK
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});


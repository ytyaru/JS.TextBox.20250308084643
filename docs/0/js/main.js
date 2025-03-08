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
    
    document.querySelector(`main`).append(
        van.tags.textarea({style:`width:50%;height:${document.documentElement.clientHeight};resize:none;`}, `alert('Hello JavaScript !!');
console.log('Hello JavaScript !!');`),
        van.tags.textarea({style:`width:50%;height:${document.documentElement.clientHeight};resize:none;`}, `alert('Hello JavaScript !!');
console.log('Hello JavaScript !!');`),
    );
});
window.addEventListener('beforeunload', (event) => {
    console.log('beforeunload!!');
});


const R = require('ramda');

const styles = (content, type) => {
    if(R.type(content) !== 'Array') {
        console.log('@TODO - why isn\'t content an array?')
        content = [content];
    }

    return R.map((node) => {
        if(node.nodeType === 'text') {
            return R.assoc('marks', R.append({ type }, node.marks), node);
        } else if (node.content.length) {
            return R.assoc('content', styles(node.content, type), node);
        } else {
            return [{
                data: {},
                marks: [{ type }],
                value: '',
                nodeType: 'text'
            }];
        }
    }, content);
}

module.exports = styles;

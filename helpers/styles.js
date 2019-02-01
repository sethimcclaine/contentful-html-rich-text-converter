const R = require('ramda');

const styles = (content, type) => {
    if (R.type(content) !== 'Array') {
        console.log('@TODO - why isn\'t content an array?')
        content = [content];
    }

    if (!content.length) {
        return [{
            data: {},
            marks: [{ type }],
            value: '',
            nodeType: 'text'
        }];
    }

    return R.map((node) => {
        if(node.nodeType === 'text') {
            return R.assoc('marks', R.append({ type }, node.marks), node);
        } else {
            return R.assoc('content', styles(node.content, type), node);
        }
    }, content);
}

module.exports = styles;

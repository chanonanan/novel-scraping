{
    novels: { // store smth to index/filtering novels
        uuid: {
            display: true
        }
        ...
    },
    details: { // store specific details of each novels
        uuid: {
            description: 'text'
            pic: 'base64? or link to img'
            ...
        }
    },
    chapters: { // store content of each chapter
        uuid: {
            1: {
                title: 'text'
                content: 'text'
            }
        }
    }
}
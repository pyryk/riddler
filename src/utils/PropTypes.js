import React from 'react';

export const Maybe = React.PropTypes.shape({
    isValue: React.PropTypes.bool.isRequired,
    val: React.PropTypes.any
});

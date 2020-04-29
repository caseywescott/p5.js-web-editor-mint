import PropTypes from 'prop-types';
import React from 'react';

import GithubIcon from '../../../images/github.svg';

function GithubButton(props) {
  return (
    <a
      className="github-button"
      href="/auth/github"
    >
      <GithubIcon className="github-icon" />
      <span>{props.buttonText}</span>
    </a>
  );
}

GithubButton.propTypes = {
  buttonText: PropTypes.string.isRequired
};

export default GithubButton;

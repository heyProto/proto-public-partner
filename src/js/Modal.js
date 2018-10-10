import React from 'react';
import ReactModal from 'react-modal';

class Modal extends React.Component {

  constructor () {
    super();
    this.afterOpen = this.afterOpen.bind(this);
    this.handleRequestClose = this.handleRequestClose.bind(this);
  }

  afterOpen() {
    if (this.props.iframeURL) {
      setTimeout((e) => {
        new ProtoEmbed.initFrame(document.getElementById('protograph_modal_card'), this.props.iframeURL, this.props.mode, {
          headerJSON: ProtoGraph.headerJSON
        });
      }, 0);
    }
    document.body.style['overflow-y'] = 'hidden';
  }

  handleRequestClose() {
    document.body.style['overflow-y'] = 'auto';
  }

  render() {
    return(
      <ReactModal
        isOpen={this.props.showModal}
        onAfterOpen={this.afterOpen}
        onRequestClose={((e) => {
          this.handleRequestClose(e);
          this.props.closeModal(e);
        })}
        closeTimeoutMS={0}
        overlayClassName="protograph-modal-overlay"
        className="proto-col col-7 protograph-modal"
        shouldFocusAfterRender={false}
        shouldCloseOnOverlayClick={true}
        shouldCloseOnEsc={false}
        shouldReturnFocusAfterClose={true}
        role="dialog"
        parentSelector={() => document.body}
        aria={{
          labelledby: "heading",
          describedby: "full_description"
        }}
      >
        <div
          className="protograph-close-modal"
          onClick={((e) => {
            this.handleRequestClose(e);
            this.props.closeModal(e);
          })}
        >
          <div className="protograph-close-text"><i className="remove icon"></i></div>
        </div>
        <div id="protograph_modal_card" style={{height:580}}></div>
      </ReactModal>
    )
  }
}

export default Modal;
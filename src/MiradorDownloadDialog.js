import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Typography from '@material-ui/core/Typography';
import { getCanvasLabel, getSelectedCanvases, selectInfoResponse } from 'mirador/dist/es/src/state/selectors/canvases';
import { getWindowViewType } from 'mirador/dist/es/src/state/selectors/windows';
import { getManifestoInstance } from 'mirador/dist/es/src/state/selectors/manifests';
import CanvasDownloadLinks from './CanvasDownloadLinks';
import ManifestDownloadLinks from './ManifestDownloadLinks';

const mapDispatchToProps = (dispatch, { windowId }) => ({
  closeDialog: () => dispatch({ type: 'CLOSE_WINDOW_DIALOG', windowId }),
});

const mapStateToProps = (state, { windowId }) => ({
  canvases: getSelectedCanvases(state, { windowId }),
  canvasLabel: canvasIndex => (getCanvasLabel(state, { canvasIndex, windowId })),
  infoResponse: selectInfoResponse(state, { windowId }),
  manifest: getManifestoInstance(state, { windowId }),
  restrictDownloadOnSizeDefinition: state.config.miradorDownloadPlugin
                                    && state.config
                                      .miradorDownloadPlugin
                                      .restrictDownloadOnSizeDefinition,
  open: (state.windowDialogs[windowId] && state.windowDialogs[windowId].openDialog === 'download'),
  viewType: getWindowViewType(state, { windowId }),
});


/**
 * MiradorDownloadDialog ~
*/
export class MiradorDownloadDialog extends Component {
  renderings() {
    const { manifest } = this.props;
    if (!(
      manifest
      && manifest.getSequences()
      && manifest.getSequences()[0]
      && manifest.getSequences()[0].getRenderings()
    )) return [];

    return manifest.getSequences()[0].getRenderings();
  }

  /**
   * Returns the rendered component
  */
  render() {
    const {
      canvases,
      canvasLabel,
      classes,
      closeDialog,
      infoResponse,
      open,
      restrictDownloadOnSizeDefinition,
      viewType,
      windowId,
    } = this.props;

    if (!open) return ('');

    return (
      <React.Fragment>
        <Dialog
          disableEnforceFocus
          onClose={closeDialog}
          open={open}
          scroll="paper"
          fullWidth
          maxWidth="xs"
        >
          <DialogTitle disableTypography className={classes.h2}>
            <Typography variant="h2">Download</Typography>
          </DialogTitle>
          <DialogContent>
            {canvases.map(canvas => (
              <CanvasDownloadLinks
                canvas={canvas}
                canvasLabel={canvasLabel(canvas.index)}
                classes={classes}
                infoResponse={infoResponse}
                restrictDownloadOnSizeDefinition={restrictDownloadOnSizeDefinition}
                key={canvas.id}
                viewType={viewType}
                windowId={windowId}
              />
            ))}
            {this.renderings().length > 0
              && <ManifestDownloadLinks classes={classes} renderings={this.renderings()} />
            }
          </DialogContent>
          <DialogActions>
            <Button onClick={closeDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    );
  }
}

MiradorDownloadDialog.propTypes = {
  canvasLabel: PropTypes.func.isRequired,
  canvases: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.string, index: PropTypes.number }),
  ),
  classes: PropTypes.shape({
    h2: PropTypes.string,
    h3: PropTypes.string,
  }).isRequired,
  closeDialog: PropTypes.func.isRequired,
  infoResponse: PropTypes.shape({
    json: PropTypes.object,
  }),
  manifest: PropTypes.shape({
    getSequences: PropTypes.func,
  }),
  open: PropTypes.bool,
  restrictDownloadOnSizeDefinition: PropTypes.bool,
  viewType: PropTypes.string.isRequired,
  windowId: PropTypes.string.isRequired,
};
MiradorDownloadDialog.defaultProps = {
  canvases: [],
  infoResponse: {},
  manifest: {},
  open: false,
  restrictDownloadOnSizeDefinition: false,
};

const styles = () => ({
  h2: {
    paddingBottom: 0,
  },
  h3: {
    marginTop: '20px',
  },
});

export default {
  target: 'Window',
  mode: 'add',
  name: 'MiradorDownloadDialog',
  component: withStyles(styles)(MiradorDownloadDialog),
  mapDispatchToProps,
  mapStateToProps,
};

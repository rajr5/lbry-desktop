// @flow
import React from 'react';
import LoadingScreen from 'component/common/loading-screen';
import PdfViewer from 'component/viewers/pdfViewer';
import ThreeViewer from 'component/viewers/threeViewer';
import DocumentViewer from 'component/viewers/documentViewer';
import DocxViewer from 'component/viewers/docxViewer';

type Props = {
  mediaType: string,
  source: {
    filePath: string,
    fileType: string,
    downloadPath: string,
  },
  currentTheme: string,
};

class FileRender extends React.PureComponent<Props> {
  renderViewer() {
    const { source, mediaType, currentTheme: theme } = this.props;
    const viewerProps = { source, theme };

    // Supported mediaTypes
    const mediaTypes = {
      '3D-file': <ThreeViewer {...viewerProps} />,
      document: <DocumentViewer {...viewerProps} />,
      // Add routes to viewer...
    };

    // Supported fileType
    const fileTypes = {
      pdf: <PdfViewer {...viewerProps} />,
      docx: <DocxViewer {...viewerProps} />,
      // Add routes to viewer...
    };

    const { fileType } = source;
    const viewer = mediaType && source && (fileTypes[fileType] || mediaTypes[mediaType]);
    const unsupportedMessage = __("Sorry, looks like we can't preview this file.");
    const unsupported = <LoadingScreen status={unsupportedMessage} spinner={false} />;

    // Return viewer
    return viewer || unsupported;
  }

  render() {
    return <div className="file-render">{this.renderViewer()}</div>;
  }
}

export default FileRender;

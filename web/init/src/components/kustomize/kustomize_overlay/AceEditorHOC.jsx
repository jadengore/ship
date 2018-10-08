import React from "react";
import * as ast from "yaml-ast-parser";
import find from "lodash/find";

export const PATCH_TOKEN = "TO_BE_MODIFIED";

export class AceEditorHOC extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      activeMarker: [],
      markers: [],
      AceEditor: null,
    };
    this.addListener = null;
    this.removeListener = null;

    import("react-ace").then((AceEditor) => this.setState({ AceEditor }));
  }

  componentDidUpdate(prevProps) {
    const { fileToView } = this.props;
    if (fileToView !== prevProps.fileToView) {
      if (fileToView.baseContent && fileToView.isSupported) {
        const markers = this.createMarkers(fileToView);
        this.setState({ markers });
      }
    }
    if (
      (this.props.overlayOpen !== prevProps.overlayOpen) ||
      (this.props.diffOpen !== prevProps.diffOpen)
    ) {
      if (this.aceEditorBase) {
        this.aceEditorBase.editor.resize();
      }
    }
  }

  componentDidMount() {
    import("brace").then(({ acequire }) => {
      const { addListener, removeListener } = acequire("ace/lib/event");
      this.addListener = addListener;
      this.removeListener = removeListener;

      addListener(this.aceEditorBase.editor, "click", this.addToOverlay)
      addListener(this.aceEditorBase.editor.renderer.scroller, "mousemove", this.setActiveMarker);
      addListener(this.aceEditorBase.editor.renderer.scroller, "mouseout", this.setActiveMarker);
    })
  }

  componentWillUnmount() {
    if (this.removeListener) {
      this.removeListener(this.aceEditorBase.editor, "click", this.addToOverlay);
      this.removeListener(this.aceEditorBase.editor.renderer.scroller, "mousemove", this.setActiveMarker);
      this.removeListener(this.aceEditorBase.editor.renderer.scroller, "mouseout", this.setActiveMarker)
    }
  }

  findMarkerAtRow = (row, markers) => (
    find(markers, ({ startRow, endRow }) => ( row >= startRow && row <= endRow ))
  )

  addToOverlay = () => {
    const { handleGeneratePatch } = this.props;
    const { activeMarker } = this.state;

    if (activeMarker.length > 0) {
      const matchingMarker = activeMarker[0];
      const { path } = matchingMarker;
      handleGeneratePatch(path);
    }
  }

  setActiveMarker = (e) => {
    const { clientY } = e;
    const { markers, activeMarker } = this.state;

    const renderer = this.aceEditorBase.editor.renderer;
    const canvasPos = renderer.scroller.getBoundingClientRect();

    const row = Math.ceil((clientY + renderer.scrollTop - canvasPos.top) / renderer.lineHeight);
    const matchingMarker = this.findMarkerAtRow(row, markers);

    if (matchingMarker) {
      renderer.setCursorStyle("pointer");
      const [ activeMarker0 = {} ] = activeMarker;
      if (matchingMarker.startRow !== activeMarker0.startRow) {
        this.setState({ activeMarker: [ matchingMarker ] });
      }
    } else {
      this.setState({ activeMarker: [] });
    }
  }

  createMarkers = (fileToView) => {
    if (this.aceEditorBase) {
      let markers = [];
      const loadedAst = ast.safeLoad(fileToView.baseContent, null);
      this.createMarkersRec(loadedAst, [], markers);
      return markers;
    }
  }

  createMarkersRec = (ast, path, markers) => {
    const aceDoc = this.aceEditorBase.editor.getSession().getDocument();

    const createMarkersSlice = ({ items }) => {
      if (items && items.length > 0) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          this.createMarkersRec(item, [...path, i], markers);
        }
      }
    };

    const createMarkersMap = ({ mappings }) => {
      for (const mapping of mappings) {
        const { value, key } = mapping;
        if (value === null) {
          const { startPosition, endPosition } = ast;
          const { row: startRow } = aceDoc.indexToPosition(startPosition, 0);
          const { row: endRow } = aceDoc.indexToPosition(endPosition, 0);
          const nullMarker = {
            startRow,
            endRow: endRow + 1,
            className: "marker-highlight-null",
            mapping,
            path: [...path, key.value],
          }
          return markers.push(nullMarker);
        }
        const newPathKey = key.value;
        this.createMarkersRec(value, [...path, newPathKey], markers);
      }
    };

    if (ast.mappings) {
      return createMarkersMap(ast);
    }
    if (ast.items) {
      return createMarkersSlice(ast);
    }

    const { startPosition, endPosition } = ast;
    const { row: startRow } = aceDoc.indexToPosition(startPosition, 0);
    const { row: endRow } = aceDoc.indexToPosition(endPosition, 0);
    const newMarker = {
      startRow,
      endRow: endRow + 1,
      className: "marker-highlight",
      mapping: ast,
      path,
    };
    markers.push(newMarker);
  }

  render() {
    const { fileToView } = this.props;
    const { activeMarker, AceEditor } = this.state;

    if (!AceEditor) {
      return null;
    }

    return (
      <AceEditor
        ref={(editor) => { this.aceEditorBase = editor }}
        mode="yaml"
        theme="chrome"
        className="flex1 flex"
        readOnly={true}
        value={fileToView && fileToView.baseContent || ""}
        height="100%"
        width="100%"
        editorProps={{
          $blockScrolling: Infinity,
          useSoftTabs: true,
          tabSize: 2,
        }}
        setOptions={{
          scrollPastEnd: false
        }}
        markers={activeMarker}
      />
    );
  }
}

const NoteDialog = ({ open, onClose, note, onNoteChange, onSave }) => (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add a Note</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Type your note below:
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="note"
          label="Note"
          type="text"
          fullWidth
          variant="outlined"
          value={note}
          onChange={onNoteChange}
          multiline
          rows={4}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} style={{ color: 'red' }}>
          Cancel
        </Button>
        <Button onClick={onSave} style={{ color: 'green' }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
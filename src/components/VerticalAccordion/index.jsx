// Component for a generic editable accordion
const EditableAccordion = ({ expanded, onChange, fieldKeys, client, handleChange }) => (
    <Accordion expanded={expanded} onChange={onChange}>
      <AccordionSummary expandIcon={<ExpandMoreIcon style={{ color: '#FFF' }} />}>
        <Typography>{fieldKeys.title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        {fieldKeys.keys.map(key => (
          <TextField
            key={key}
            label={key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.slice(1)}
            value={client[key] || ''}
            onChange={handleChange}
            name={key}
            fullWidth
            margin="dense"
            variant="outlined"
            InputProps={{
              style: { backgroundColor: '#333', color: '#FFF' }
            }}
            InputLabelProps={{
              style: { color: '#FFF' }
            }}
          />
        ))}
      </AccordionDetails>
    </Accordion>
  );
  
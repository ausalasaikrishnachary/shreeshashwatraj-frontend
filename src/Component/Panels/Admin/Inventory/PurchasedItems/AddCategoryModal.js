// AddCategoryModal.js
import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import { baseurl } from "../../../../BaseURL/BaseURL";


const AddCategoryModal = ({ show, onClose, onSave }) => {
  const [categoryName, setCategoryName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

 // AddCategoryModal.js
const handleSave = async () => {
  if (categoryName.trim() === "") return;
  
  setIsSaving(true);
  try {
    const response = await axios.post(`${baseurl}/categories`, {
      category_name: categoryName
    });
    onSave(response.data); // Pass the full saved category object
    setCategoryName("");
    onClose();
  } catch (error) {
    console.error("Error saving category:", error);
  } finally {
    setIsSaving(false);
  }
};

  return (
    <Modal show={show} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Add Category</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <Form.Label>Category Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter category name"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
          />
        </Form.Group>
        <Button variant="info" onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </Modal.Body>
    </Modal>
  );
};
export default AddCategoryModal;
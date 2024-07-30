import { useState } from 'react';

const PostForm = ({ showForm, onSubmit,setDialog }) => {
  const [formData, setFormData] = useState({
    location: '',
    description: '',
    startDate: '',
    endDate: '',
    thoughtfulMemories: [''],
    privatePost: false,
    images: []
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: checked });
    } else if (type === 'file') {
      setFormData({ ...formData, [name]: Array.from(files) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleMemoryChange = (index, value) => {
    const memories = [...formData.thoughtfulMemories];
    memories[index] = value;
    setFormData({ ...formData, thoughtfulMemories: memories });
  };

  const addMemoryField = () => {
    setFormData({ ...formData, thoughtfulMemories: [...formData.thoughtfulMemories, ''] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!showForm) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white p-4 shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create a New Post</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md"></textarea>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <input type="date" name="endDate" value={formData.endDate} onChange={handleChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Thoughtful Memories</label>
          {formData.thoughtfulMemories.map((memory, index) => (
            <input
              key={index}
              type="text"
              value={memory}
              onChange={(e) => handleMemoryChange(index, e.target.value)}
              className="mt-1 p-2 block w-full border border-gray-300 rounded-md mb-2"
            />
          ))}
          <button type="button" onClick={addMemoryField} className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md">Add Memory</button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Private Post</label>
          <input type="checkbox" name="privatePost" checked={formData.privatePost} onChange={handleChange} className="mt-1" />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Images</label>
          <input type="file" name="images" multiple onChange={handleChange} className="mt-1 p-2 block w-full border border-gray-300 rounded-md" />
        </div>
        <button type="submit" className="mt-4 px-4 py-2 bg-green-500 text-white rounded-md">Submit</button>
        <button className="mt-4 mx-4 px-4 py-2 bg-red-500 text-white rounded-md" onClick={()=>{
          setFormData({    
            location: '',
            description: '',
            startDate: '',
            endDate: '',
            thoughtfulMemories: [''],
            privatePost: false,
            images: []
          })
          setDialog(false)
        }}>Cancel</button>
      </form>
    </div>
  );
};

export default PostForm;
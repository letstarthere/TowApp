import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { ArrowLeft, Car, Plus, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  type: string;
  isDefault?: boolean;
}

const vehicleBrands = [
  'Toyota', 'Volkswagen', 'BMW', 'Mercedes-Benz', 'Audi', 'Ford', 'Chevrolet', 
  'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Isuzu', 'Mitsubishi', 'Renault', 'Other'
];

const vehicleTypes = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'suv', label: 'SUV' },
  { value: 'bakkie', label: 'Bakkie/Pickup' },
  { value: 'truck', label: 'Truck' },
  { value: 'van', label: 'Van' },
  { value: 'coupe', label: 'Coupe' },
  { value: 'other', label: 'Other' }
];

export default function UserVehicles() {
  const [, setLocation] = useLocation();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    type: ''
  });

  useEffect(() => {
    // Load vehicles from localStorage
    const savedVehicle = localStorage.getItem('userVehicle');
    if (savedVehicle) {
      const vehicle = JSON.parse(savedVehicle);
      setVehicles([{
        id: '1',
        ...vehicle,
        isDefault: true
      }]);
    }
  }, []);

  const handleSaveVehicle = () => {
    if (!formData.brand || !formData.model || !formData.type) return;

    if (editingVehicle) {
      // Update existing vehicle
      setVehicles(prev => prev.map(v => 
        v.id === editingVehicle.id 
          ? { ...v, ...formData }
          : v
      ));
    } else {
      // Add new vehicle
      const newVehicle: Vehicle = {
        id: Date.now().toString(),
        ...formData,
        isDefault: vehicles.length === 0
      };
      setVehicles(prev => [...prev, newVehicle]);
    }

    // Update localStorage with default vehicle
    const defaultVehicle = vehicles.find(v => v.isDefault) || vehicles[0];
    if (defaultVehicle) {
      localStorage.setItem('userVehicle', JSON.stringify({
        brand: defaultVehicle.brand,
        model: defaultVehicle.model,
        type: defaultVehicle.type
      }));
    }

    setFormData({ brand: '', model: '', type: '' });
    setEditingVehicle(null);
    setIsDialogOpen(false);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      brand: vehicle.brand,
      model: vehicle.model,
      type: vehicle.type
    });
    setIsDialogOpen(true);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    setVehicles(prev => prev.filter(v => v.id !== vehicleId));
  };

  const handleAddNew = () => {
    setEditingVehicle(null);
    setFormData({ brand: '', model: '', type: '' });
    setIsDialogOpen(true);
  };

  const getVehicleTypeLabel = (type: string) => {
    return vehicleTypes.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/profile')}
            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">My Vehicles</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="max-w-2xl mx-auto">
          {vehicles.length === 0 ? (
            <div className="text-center py-12">
              <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">No vehicles added</h2>
              <p className="text-gray-600 mb-6">
                Add your vehicle details for faster service and better estimates
              </p>
              <Button onClick={handleAddNew} className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Vehicle
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Your Vehicles</h2>
                <Button onClick={handleAddNew} size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vehicle
                </Button>
              </div>

              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <Card key={vehicle.id} className="border border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Car className="w-8 h-8 text-orange-500" />
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {vehicle.brand} {vehicle.model}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {getVehicleTypeLabel(vehicle.type)}
                              {vehicle.isDefault && (
                                <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                                  Default
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditVehicle(vehicle)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Vehicle Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingVehicle ? 'Edit Vehicle' : 'Add New Vehicle'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Brand
              </label>
              <Select value={formData.brand} onValueChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select brand" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleBrands.map((brand) => (
                    <SelectItem key={brand} value={brand}>
                      {brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Model
              </label>
              <Input
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                placeholder="e.g. Corolla, Golf, 3 Series"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vehicle Type
              </label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveVehicle}
                disabled={!formData.brand || !formData.model || !formData.type}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                {editingVehicle ? 'Update' : 'Add'} Vehicle
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
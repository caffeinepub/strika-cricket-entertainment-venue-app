import { useState } from 'react';
import { Calendar, Clock, Plus, ToggleLeft, ToggleRight, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useGetAllTimeSlots, useCreateTimeSlot, useToggleTimeSlotAvailability, useToggleTimeSlotLiveStatus, useBulkSetTimeSlotStates } from '../hooks/useQueries';
import { toast } from 'sonner';
import type { Time } from '../backend';

export default function AvailabilityManagementPanel() {
  const { data: timeSlots = [], isLoading } = useGetAllTimeSlots();
  const createTimeSlot = useCreateTimeSlot();
  const toggleAvailability = useToggleTimeSlotAvailability();
  const toggleLiveStatus = useToggleTimeSlotLiveStatus();
  const bulkSetStates = useBulkSetTimeSlotStates();

  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const formatTime = (timestamp: Time) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreateSlots = async () => {
    if (!selectedDate || !startTime || !endTime) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const start = new Date(`${selectedDate}T${startTime}`);
      const end = new Date(`${selectedDate}T${endTime}`);

      if (start >= end) {
        toast.error('End time must be after start time');
        return;
      }

      const slots: Time[] = [];
      let current = new Date(start);

      while (current < end) {
        const timestamp = BigInt(current.getTime() * 1000000);
        slots.push(timestamp);
        current = new Date(current.getTime() + 30 * 60 * 1000); // Add 30 minutes
      }

      for (const slot of slots) {
        await createTimeSlot.mutateAsync({ startTime: slot, duration: BigInt(30) });
      }

      toast.success(`Created ${slots.length} time slots successfully!`);
      setSelectedDate('');
      setStartTime('');
      setEndTime('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create time slots');
      console.error(error);
    }
  };

  const handleToggleEnabled = async (startTime: Time) => {
    try {
      await toggleAvailability.mutateAsync(startTime);
      toast.success('Slot availability updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle availability');
      console.error(error);
    }
  };

  const handleToggleLive = async (startTime: Time) => {
    try {
      await toggleLiveStatus.mutateAsync(startTime);
      toast.success('Slot live status updated');
    } catch (error: any) {
      toast.error(error.message || 'Failed to toggle live status');
      console.error(error);
    }
  };

  const handleBulkSetStates = async (isEnabled: boolean, isLive: boolean) => {
    if (sortedSlots.length === 0) {
      toast.error('No slots available to update');
      return;
    }

    try {
      const states: Array<[Time, boolean, boolean]> = sortedSlots.map((slot) => [
        slot.startTime,
        isEnabled,
        isLive,
      ]);

      await bulkSetStates.mutateAsync(states);
      
      const statusText = isEnabled && isLive ? 'enabled and live' : 
                        !isEnabled && !isLive ? 'disabled and hidden' :
                        isEnabled ? 'enabled' : 'disabled';
      
      toast.success(`All ${sortedSlots.length} visible slots set to ${statusText}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to bulk update slots');
      console.error(error);
    }
  };

  // Sort slots by start time (most recent first)
  const sortedSlots = [...timeSlots].sort((a, b) => {
    const timeA = Number(a.startTime);
    const timeB = Number(b.startTime);
    return timeA - timeB;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Create Time Slots
          </CardTitle>
          <CardDescription>
            Create 30-minute time slots for a specific date and time range
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
          <Button
            onClick={handleCreateSlots}
            disabled={createTimeSlot.isPending}
            className="w-full sm:w-auto"
          >
            {createTimeSlot.isPending ? 'Creating...' : 'Create Slots'}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Manage Time Slots
          </CardTitle>
          <CardDescription>
            Toggle individual slots on/off (enabled) and live/unpublished status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sortedSlots.length > 0 && (
            <div className="mb-6 p-4 rounded-lg border bg-muted/20">
              <h3 className="text-sm font-semibold mb-3">Bulk Actions for All Visible Slots</h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleBulkSetStates(true, true)}
                  disabled={bulkSetStates.isPending}
                  className="gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Enable & Publish All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkSetStates(false, false)}
                  disabled={bulkSetStates.isPending}
                  className="gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Disable & Hide All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkSetStates(true, false)}
                  disabled={bulkSetStates.isPending}
                  className="gap-2"
                >
                  <ToggleRight className="w-4 h-4" />
                  Enable All (Keep Hidden)
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkSetStates(false, true)}
                  disabled={bulkSetStates.isPending}
                  className="gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Publish All (Keep Disabled)
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Applies to all {sortedSlots.length} slot{sortedSlots.length !== 1 ? 's' : ''} currently displayed below
              </p>
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading time slots...</p>
            </div>
          ) : sortedSlots.length > 0 ? (
            <div className="space-y-3">
              {sortedSlots.map((slot) => (
                <div
                  key={slot.startTime.toString()}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-lg border bg-muted/30"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{formatTime(slot.startTime)}</div>
                    <div className="text-sm text-muted-foreground">
                      Duration: {slot.duration.toString()} minutes
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={slot.isEnabled ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleEnabled(slot.startTime)}
                      disabled={toggleAvailability.isPending}
                      className="gap-2"
                    >
                      {slot.isEnabled ? (
                        <>
                          <ToggleRight className="w-4 h-4" />
                          Enabled
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4" />
                          Disabled
                        </>
                      )}
                    </Button>
                    <Button
                      variant={slot.isLive ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleToggleLive(slot.startTime)}
                      disabled={toggleLiveStatus.isPending}
                      className="gap-2"
                    >
                      {slot.isLive ? (
                        <>
                          <Eye className="w-4 h-4" />
                          Live
                        </>
                      ) : (
                        <>
                          <EyeOff className="w-4 h-4" />
                          Hidden
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Time Slots</h3>
              <p className="text-muted-foreground">Create time slots to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

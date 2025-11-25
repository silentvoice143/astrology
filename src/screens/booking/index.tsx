import {View, Text, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {Calendar} from 'react-native-calendars';
import PageWithHeader from '../../componentsV1/layout/page-with-header';
import {scale, verticalScale, scaleFont} from '../../utils/sizer';
import {COLORS} from '../../constants/colors';

const TIME_SLOTS = [
  {label: '5 min', value: 5},
  {label: '10 min', value: 10},
  {label: '15 min', value: 15},
  {label: '30 min', value: 30},
  {label: '45 min', value: 45},
  {label: '1 hr', value: 60},
];

const COST_PER_MINUTE = 20; // Example: ₹20/min

const Booking = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);

  const toggleSlot = (value: number) => {
    if (selectedSlots.includes(value)) {
      setSelectedSlots(selectedSlots.filter(item => item !== value));
    } else {
      setSelectedSlots([...selectedSlots, value]);
    }
  };

  const totalMinutes = selectedSlots.reduce((a, b) => a + b, 0);
  const totalCost = totalMinutes * COST_PER_MINUTE;

  return (
    <PageWithHeader themeMode="light">
      <View
        style={{
          paddingHorizontal: scale(20),
          paddingBottom: verticalScale(20),
          paddingTop: verticalScale(20),
          backgroundColor: COLORS.theme.white,
          flex: 1,
        }}>
        {/* Calendar */}
        <Calendar
          style={{
            borderWidth: 1,
            borderColor: COLORS.theme.secondary,
            borderRadius: scale(12),
          }}
          onDayPress={(day: any) => {
            setSelectedDate(day.dateString);
          }}
          markedDates={{
            [selectedDate]: {
              selected: true,
              selectedColor: COLORS.theme.primary,
            },
          }}
        />

        {/* Date Display */}
        {selectedDate ? (
          <Text
            style={{
              marginTop: verticalScale(16),
              fontSize: scaleFont(16),
              fontWeight: '600',
            }}>
            Selected Date: {selectedDate}
          </Text>
        ) : null}

        {/* Time Slot Selection */}
        <Text
          style={{
            marginTop: verticalScale(24),
            fontSize: scaleFont(18),
            fontWeight: '700',
          }}>
          Select Duration
        </Text>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: scale(10),
            marginTop: verticalScale(12),
          }}>
          {TIME_SLOTS.map(slot => {
            const isSelected = selectedSlots.includes(slot.value);
            return (
              <TouchableOpacity
                key={slot.value}
                onPress={() => toggleSlot(slot.value)}
                style={{
                  paddingVertical: verticalScale(10),
                  paddingHorizontal: scale(14),
                  borderRadius: scale(8),
                  borderWidth: 1,
                  borderColor: isSelected
                    ? COLORS.theme.primary
                    : COLORS.theme.secondary,
                  backgroundColor: isSelected
                    ? COLORS.theme.primary
                    : COLORS.theme.white,
                }}>
                <Text
                  style={{
                    fontSize: scaleFont(14),
                    color: isSelected ? COLORS.theme.white : COLORS.theme.black,
                    fontWeight: '600',
                  }}>
                  {slot.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Cost Summary */}
        {selectedSlots.length > 0 && (
          <View
            style={{
              marginTop: verticalScale(30),
              padding: scale(16),
              backgroundColor: COLORS.theme.secondary,
              borderRadius: scale(12),
            }}>
            <Text style={{fontSize: scaleFont(16), fontWeight: '700'}}>
              Total Duration: {totalMinutes} minutes
            </Text>
            <Text
              style={{
                fontSize: scaleFont(18),
                marginTop: verticalScale(6),
                color: COLORS.theme.primary,
                fontWeight: '800',
              }}>
              Total Cost: ₹{totalCost}
            </Text>
          </View>
        )}

        {/* Button */}
        <TouchableOpacity
          disabled={selectedSlots.length === 0 || !selectedDate}
          style={{
            marginTop: verticalScale(24),
            backgroundColor:
              selectedSlots.length === 0 || !selectedDate
                ? '#ccc'
                : COLORS.theme.primary,
            paddingVertical: verticalScale(14),
            borderRadius: scale(12),
            alignItems: 'center',
            marginBottom: verticalScale(80),
          }}>
          <Text
            style={{
              fontSize: scaleFont(16),
              fontWeight: '700',
              color:
                selectedSlots.length === 0 || !selectedDate
                  ? '#666'
                  : COLORS.theme.white,
            }}>
            Book Appointment
          </Text>
        </TouchableOpacity>
      </View>
    </PageWithHeader>
  );
};

export default Booking;

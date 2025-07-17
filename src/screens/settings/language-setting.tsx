import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert, // Using Alert for a simple confirmation message
} from 'react-native';
import ScreenLayout from '../../components/screen-layout';
import {themeColors} from '../../constants/colors';
import {useAppDispatch, useAppSelector} from '../../hooks/redux-hook';
import {setLanguage} from '../../store/reducer/settings';

const LanguageSetting = () => {
  const selectedLanguage = useAppSelector(state => state.setting.language);
  const dispatch = useAppDispatch();

  const languages = [
    {code: 'en', name: 'English', nativeName: 'English'},
    {code: 'hi', name: 'Hindi', nativeName: 'हिंदी'},
    {code: 'bn', name: 'Bengali', nativeName: 'বাংলা'},
  ];

  const handleSelectLanguage = code => {
    dispatch(setLanguage(code));
  };

  const handleContinue = () => {
    Alert.alert(
      'Language Selected',
      `You have selected: ${
        languages.find(lang => lang.code === selectedLanguage)?.name
      }`,
      [{text: 'OK'}],
    );
    // In a real app, you would save this selection (e.g., AsyncStorage, Context, Redux)
    // and navigate to the next screen.
  };

  return (
    <ScreenLayout headerBackgroundColor={themeColors.surface.background}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Select Your Language</Text>
          <Text style={styles.headerSubtitle}>अपनी भाषा चुनें</Text>
        </View>

        <View style={styles.languageOptionsContainer}>
          {languages.map(lang => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageOption,
                selectedLanguage === lang.code && styles.selectedLanguageOption,
              ]}
              onPress={() => handleSelectLanguage(lang.code)}>
              <View style={styles.languageTextContainer}>
                <Text style={styles.languageName}>{lang.name}</Text>
                <Text style={styles.languageNativeName}>{lang.nativeName}</Text>
              </View>
              {selectedLanguage === lang.code && (
                <View style={styles.checkmarkContainer}>
                  {/* Simple checkmark SVG or icon could go here */}
                  <Text style={styles.checkmark}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  headerContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#666',
  },
  languageOptionsContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  selectedLanguageOption: {
    backgroundColor: '#e6f7ff', // Light blue background for selected
  },
  languageTextContainer: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  languageNativeName: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007bff', // Blue background for checkmark
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    width: '100%',
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    alignItems: 'center',
  },
  continueButton: {
    backgroundColor: '#007bff', // Primary blue button
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 8,
    width: '100%',
    maxWidth: 300,
    alignItems: 'center',
    shadowColor: '#007bff',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LanguageSetting;

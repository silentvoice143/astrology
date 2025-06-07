import {StyleSheet} from 'react-native';
import {scale, verticalScale, moderateScale, scaleFont} from '../utils/sizer';
import {colors} from '../constants/colors';

const HomeStyle = StyleSheet.create({
  container: {
    padding: scale(28),
    // gap: verticalScale(20),
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  greetingText: {
    fontSize: scaleFont(20),
    fontWeight: '400',
    color: colors.primaryText,
  },
  userName: {
    fontWeight: '700',
    color: colors.userNmaeText,
  },
  horoscopeButton: {
    backgroundColor: colors.secondarybtn,
    borderRadius: scale(20),
    marginHorizontal: scale(40),
    marginTop: scale(52),
    // paddingHorizontal: scale(20),
    paddingVertical: verticalScale(12),
  },
  horoscopeText: {
    color: '#fff',
  },
  searchContainer: {
    marginTop: verticalScale(30),
  },
  searchInput: {
    borderRadius: scale(24),
    borderColor: colors.primarybtn,
    borderWidth: 1,
    paddingHorizontal: scale(16),
    paddingVertical: verticalScale(12),
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: verticalScale(44),
    justifyContent: 'space-between',
  },

  singleAction: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: scale(5),
  },

  actionCard: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: scale(24),
    paddingVertical: verticalScale(16),
    backgroundColor: '#fff',
    borderRadius: scale(15),

    // Android shadow
    elevation: 4,

    // iOS shadow
    shadowColor: colors.primarybtn,
    shadowOffset: {width: 25, height: 25},
    shadowOpacity: 1,
    shadowRadius: 17,
  },

  actionText: {
    textAlign: 'center',
    fontSize: scaleFont(14),
    fontWeight: '500',
    color: colors.secondaryText,
    marginTop: verticalScale(16),
  },
  kundliButton: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: scale(16),
    marginVertical: verticalScale(16),
    flexDirection:"row",
    backgroundColor:colors.secondarybtn,
    // gap:scale(43),
    marginTop:verticalScale(40),
  },
  kundliText: {
    fontSize: scaleFont(16),
    fontWeight: '600',
    color: '#fff',
    marginHorizontal:scale(28),
  },
  sectionTitle: {
    marginTop: verticalScale(30),
    fontSize: scaleFont(18),
    fontWeight: '600',
    color: colors.primaryText,
  },
});

export default HomeStyle;

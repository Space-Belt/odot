import React, {useEffect, useState} from 'react';
import {
  SectionList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import moment from 'moment';
import ReusableHeader from '../components/Headers/ReusableHeader';
import {getStorageData} from '../lib/storage-helper';
import {TodoItem} from '../types/todos';

export interface Item {
  id: number;
  title: string;
  date: string;
}

export interface ItemType {
  id: string;
  name: string;
}

export interface SectionType {
  title: string;
  data: ItemType[];
}

export interface TempType {
  count: string;
  fullDate: string;
}

export interface TempGroupType {
  title: string;
  data: TempType[];
}

const TodoListGroupScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();

  const today = moment().format('YYYY/MM/DD');
  const [year, month, date] = today.split('/');

  const [sections, setSections] = useState<TempGroupType[]>([]);

  const handleClick = () => {
    navigation.goBack();
  };

  const handleAddTask = () => {
    AsyncStorage.setItem(
      'date',
      JSON.stringify({
        year: year,
        month: month,
        day: date,
      }),
    );
    navigation.navigate('AddTaskScreen');
  };
  const [todoData, setTodoData] = useState<TempType[]>([]);

  const renderSectionHeader = ({section}: {section: any}) => {
    return (
      <View style={styles.sectionHeader}>
        <Text>{section.title}</Text>
      </View>
    );
  };

  const handleListClicked = (date: string) => {
    let [clickedYear, clickedMonth, clickedDate] = date.split('/');
    AsyncStorage.setItem(
      'date',
      JSON.stringify({
        year: clickedYear,
        month: clickedMonth,
        day: clickedDate,
      }),
    );
    navigation.navigate('TodoListScreen');
  };

  const keyExtractor = (item: TempType) =>
    `section-list-item-=${item.fullDate}`;
  const renderItem = ({item}: {item: TempType}) => {
    return (
      <TouchableOpacity
        onPress={() => handleListClicked(item.fullDate)}
        activeOpacity={0.7}
        style={styles.listWrapper}>
        <Text style={styles.dateText}>
          {item.fullDate.slice(8, 10)}일 Todos
        </Text>
        <Text style={styles.countText}>{item.count}</Text>
      </TouchableOpacity>
    );
  };

  const createSections = (data: TempType[]): TempGroupType[] => {
    const nameObject: Record<string, TempType[]> = {};
    data.forEach(item => {
      const firstLetter = item.fullDate.slice(0, 7);

      if (!firstLetter) return;

      if (!nameObject[firstLetter]) {
        nameObject[firstLetter] = [item];
      } else {
        nameObject[firstLetter]!.push(item);
      }
    });

    return Object.entries(nameObject).map(([title, data]) => ({
      title,
      data,
    }));
  };

  useEffect(() => {
    const getData = async () => {
      let results = await getStorageData('todos');

      console.log(results);
      let processedData = [];
      if (results !== null) {
        for (const [tempYear, tempMonths] of Object.entries(results)) {
          for (const [tempMonth, tempDays] of Object.entries(
            tempMonths as {[key: string]: TempType[]},
          )) {
            for (const [todo, todos] of Object.entries(tempDays)) {
              let dateInfo = `${tempYear}/${tempMonth}/${todo}`;
              // let doneCount = 0;
              let aa: TodoItem[] = todos;

              let doneCount = aa.filter(todoEl => todoEl.done === true).length;

              processedData.push({
                fullDate: dateInfo,
                count: `${doneCount}/${aa.length}`,
              });
            }
          }
        }
      }
      setTodoData(processedData.reverse());
      setSections(createSections(processedData));
    };
    if (isFocused) {
      getData();
    }
  }, [isFocused]);

  return (
    <SafeAreaView style={styles.wrapper}>
      <ReusableHeader
        handleClick={handleClick}
        handleAddTask={handleAddTask}
        centerText={'Todos'}
      />
      <View style={styles.buttonWrapper}>
        {todoData.length > 0 && (
          <SectionList
            sections={sections}
            keyExtractor={keyExtractor}
            contentContainerStyle={styles.sectionStyle}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            stickySectionHeadersEnabled={true}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default TodoListGroupScreen;

const styles = StyleSheet.create({
  wrapper: {flex: 1, position: 'relative', paddingHorizontal: 10},

  header: {
    paddingVertical: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  backImg: {
    width: 25,
    height: 25,
    resizeMode: 'center',
  },
  emptyView: {
    width: 25,
    height: 25,
  },
  buttonWrapper: {
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtn: {
    width: 25,
    height: 25,
    resizeMode: 'center',
  },
  centerBtn: {
    padding: 10,
    backgroundColor: 'skyblue',
    borderRadius: 10,
  },
  btnText: {
    fontWeight: '800',
    fontSize: 18,
    color: 'white',
  },
  listWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 1,
  },
  dateText: {
    fontWeight: '600',
    fontSize: 16,
  },
  sectionHeader: {
    backgroundColor: '#F2F2F2',
  },
  sectionStyle: {gap: 10},
  countText: {
    color: '#C4C4C4',
  },
});

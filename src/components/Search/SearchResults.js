import React, {useState, useEffect} from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import LoadingSpinner from '../LoadingSpinner';
import CommonDisplayTab from '../Courses/CommonDisplayTab';
import {withNavigation} from 'react-navigation'
import {api_links} from '../../constants/API';

// Access current semester id via props.semesterID
// It's a hook, so when the user changes the main slider, the
//      will automagically propagate down here.
export default function SearchResults(props) {
    let query = props.navigation.getParam("query", "");
    let sem_id = props.navigation.getParam("sem_id", "");

    const [state, setState] = useState({
        courses: [],
        page: 0,
        semesterID: "0000",
        maxPage: Number.MAX_VALUE,
    });

    // Reset if the semester was changed
    if(props.semesterID !== state.semesterID) setState({
        courses: [],
        page: 0,
        semesterID: props.semesterID,
        maxPage: Number.MAX_VALUE,
    });

    const get = async () => {
        // console.log(`${api_links.api_base}/search?term_id=${state.semesterID}&page=${state.page}&per=50`);
        let resp = await fetch(`${api_links.api_base}/search?fuzzy=1&term_id=${sem_id}&page=${state.page}&query=${query}&per=50&scratch_duplicates=1`);
        let parsed = await resp.json();

        setState({
            courses: state.courses.concat(parsed.data),
            page: state.page + 1,
            semesterID: state.semesterID,
            maxPage: parsed.pages,
        });
    }

    let generateCourseOpener = (course) => {
        console.log(sem_id, course.subject, course.catalog_number);
        return () => {
            props.navigation.push('CourseView', {
                semesterID: sem_id,
                subject: course.subject,
                catalog_number: course.catalog_number
            })
        }
    }

    let displayCourse = course => {
        return (
            <TouchableOpacity onPress={generateCourseOpener(course)}>
                <CommonDisplayTab type={"course"} course={course}/>
            </TouchableOpacity>
        );
    }

    let nextPage = async () => {
        // console.log("Getting another page |", state.page + 1);
        if(state.page < state.maxPage) get();
    }

    // const loader = (<LoadingSpinner/>);
    const loader = (<Text>Loading...</Text>);

    if(state.page === 0 && state.semesterID !== "0000") nextPage();

    return (
        <View>
            <FlatList style={{
                        width: Dimensions.get('screen').width,
                    }}
                    contentContainerStyle={{
                        alignItems: 'center'
                    }}
                    loader={loader}
                    data={state.courses}
                    renderItem={({item}) => displayCourse(item)}
                    keyExtractor={item => item._id}
                    onEndReachedThreshold={1}
                    onEndReached={nextPage}/>
        </View>
    );
}

SearchResults.navigationOptions = ({ navigation }) => ({
    title: "Search Results",
});

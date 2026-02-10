package com.example.dailyspend.util;

import com.example.dailyspend.dto.PersonRequest;
import com.example.dailyspend.dto.PersonResponse;
import com.example.dailyspend.entity.Person;


public class PersonMapper {

    public static Person toEntity(PersonRequest request) {
        Person person = new Person();
        person.setName(request.getName());
        return person;
    }

    public static PersonResponse toResponse(Person person) {
        PersonResponse response = new PersonResponse();
        response.setId(person.getId());
        response.setName(person.getName());
        return response;
    }
}

package com.example.dailyspend.service;

import com.example.dailyspend.dto.PersonBalanceDto;
import com.example.dailyspend.dto.TransactionResponse;
import com.example.dailyspend.entity.Person;
import com.example.dailyspend.entity.Transaction;
import com.example.dailyspend.entity.User;
import com.example.dailyspend.exception.ResourceNotFoundException;
import com.example.dailyspend.repository.PersonRepository;
import com.example.dailyspend.repository.TransactionRepository;
import com.example.dailyspend.util.SecurityUtils;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PersonService {

    private final PersonRepository personRepository;
    private final TransactionRepository transactionRepository;
    private final SecurityUtils securityUtils;

    public PersonService(
            PersonRepository personRepository,
            TransactionRepository transactionRepository,
            SecurityUtils securityUtils) {
        this.personRepository = personRepository;
        this.transactionRepository = transactionRepository;
        this.securityUtils = securityUtils;
    }

    // -------- CRUD --------

    @Transactional(readOnly = true)
    public List<Person> findAll() {
        Long userId = securityUtils.getCurrentUserId();
        return personRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public Person findById(Long id) {
        Long userId = securityUtils.getCurrentUserId();
        return personRepository.findById(id)
                .filter(p -> p.getUser().getId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Person not found"));
    }

    @Transactional
    public Person save(Person person) {
        User user = new User();
        user.setId(securityUtils.getCurrentUserId());
        person.setUser(user);
        return personRepository.save(person);
    }

    @Transactional
    public Person update(Long id, Person personDetails) {
        Person person = findById(id);
        person.setName(personDetails.getName());
        return personRepository.save(person);
    }

    @Transactional
    public void deleteById(Long id) {
        Person person = findById(id);

        boolean hasTransactions = transactionRepository.existsByPersonId(id);
        if (hasTransactions) {
            throw new IllegalStateException(
                "Cannot delete person with existing transactions"
            );
        }

        personRepository.deleteById(id);
    }

    // -------- BUSINESS LOGIC --------

    
    public BigDecimal getPersonBalance(Long personId) {
        findById(personId);
        return personRepository.calculatePersonBalance(personId);
    }

    public List<Transaction> getPersonTransactions(Long personId) {
        findById(personId);
        return transactionRepository.findByPersonIdAndDeletedFalse(personId);
    }

    public PersonBalanceDto getPersonWithBalance(Long personId) {
        Person person = findById(personId);

        PersonBalanceDto dto = new PersonBalanceDto();
        dto.setId(person.getId());
        dto.setName(person.getName());
        dto.setBalance(getPersonBalance(personId));
        dto.setCreatedAt(person.getCreatedAt());

        return dto;
    }

    public List<PersonBalanceDto> getAllPeopleWithBalances() {
        return findAll().stream()
                .map(person -> {
                    PersonBalanceDto dto = new PersonBalanceDto();
                    dto.setId(person.getId());
                    dto.setName(person.getName());
                    dto.setBalance(personRepository.calculatePersonBalance(person.getId()));
                    dto.setCreatedAt(person.getCreatedAt());
                    return dto;
                })
                .toList();
    }

    public List<TransactionResponse> getPersonTransactionResponses(Long personId) {
        return getPersonTransactions(personId).stream()
                .map(this::toTransactionResponse)
                .toList();
    }

    private TransactionResponse toTransactionResponse(Transaction tx) {
        TransactionResponse response = new TransactionResponse();
        response.setId(tx.getId());
        response.setAmount(tx.getAmount());
        response.setTransactionDate(tx.getTransactionDate());
        response.setDescription(tx.getDescription());
        response.setAccountName(tx.getAccount().getName());

        if (tx.getCategory() != null) {
            response.setCategoryName(tx.getCategory().getName());
        }

        if (tx.getPerson() != null) {
            response.setPersonName(tx.getPerson().getName());
        }

        return response;
    }
}

package com.example.dailyspend.service;

import com.example.dailyspend.dto.PersonBalanceDto;
import com.example.dailyspend.dto.TransactionResponse;  // ✅ ADD THIS
import com.example.dailyspend.entity.Person;
import com.example.dailyspend.entity.Transaction;
import com.example.dailyspend.exception.ResourceNotFoundException;
import com.example.dailyspend.repository.PersonRepository;
import com.example.dailyspend.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class PersonService {

    private final PersonRepository personRepository;
    private final TransactionRepository transactionRepository;

    public PersonService(
            PersonRepository personRepository,
            TransactionRepository transactionRepository) {
        this.personRepository = personRepository;
        this.transactionRepository = transactionRepository;
    }

    // -------- CRUD --------

    public List<Person> findAll() {
        return personRepository.findAll();
    }

    public Person findById(Long id) {
        return personRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Person not found"));
    }

    @Transactional
    public Person save(Person person) {
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
        
        // Check if person has transactions
        boolean hasTransactions = transactionRepository.existsByPersonId(id);
        if (hasTransactions) {
            throw new IllegalStateException(
                "Cannot delete person with existing transactions. " +
                "Delete their transactions first."
            );
        }
        
        personRepository.deleteById(id);
    }

    // -------- BUSINESS LOGIC --------

    /**
     * Get person balance:
     * - Positive = They owe you money
     * - Negative = You owe them money
     * - Zero = All settled
     */
    public BigDecimal getPersonBalance(Long personId) {
        // Verify person exists
        findById(personId);
        return personRepository.calculatePersonBalance(personId);
    }

    /**
     * Get all transactions for a person
     */
    public List<Transaction> getPersonTransactions(Long personId) {
        // Verify person exists
        findById(personId);
        return transactionRepository.findByPersonIdAndDeletedFalse(personId);
    }

    /**
     * Get person with their balance
     */
    public PersonBalanceDto getPersonWithBalance(Long personId) {
        Person person = findById(personId);
        BigDecimal balance = getPersonBalance(personId);
        
        PersonBalanceDto dto = new PersonBalanceDto();
        dto.setId(person.getId());
        dto.setName(person.getName());
        dto.setBalance(balance);
        dto.setCreatedAt(person.getCreatedAt());
        
        return dto;
    }

    /**
     * Get all people with their balances
     */
    public List<PersonBalanceDto> getAllPeopleWithBalances() {
        return personRepository.findAll().stream()
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

    /**
     * Get person transactions as DTOs (for API responses)
     */
    public List<TransactionResponse> getPersonTransactionResponses(Long personId) {
        List<Transaction> transactions = getPersonTransactions(personId);
        return transactions.stream()
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